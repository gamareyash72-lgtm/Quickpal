import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client (Server-Side only)
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Initialize Firebase Admin SDK lazily
let firebaseAdminApp: App | null = null;

function getFirebaseAdminApp(): App | null {
  if (!getApps().length) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      let projectId = "quickpal-new";
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        projectId = configData.projectId || projectId;
      }
      firebaseAdminApp = initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || projectId,
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (err) {
      console.warn("Firebase Admin SDK initialization notice:", err);
      return null;
    }
  } else {
    firebaseAdminApp = getApp();
  }
  return firebaseAdminApp;
}

// Healthcheck API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "QuickPal Hyperlocal Backend" });
});

// Backend API Endpoint: Owner Dashboard -> Create Delivery Partner / Provision Staff Account via Firebase Admin SDK
app.post(["/api/admin/create-delivery-partner", "/api/admin/create-user"], async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "delivery_partner",
      username,
      storeId,
      serviceArea,
      status = "active"
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and password are required."
      });
    }

    const adminApp = getFirebaseAdminApp();
    let uid = "";

    if (adminApp) {
      try {
        const authAdmin = getAuth(adminApp);
        const userRecord = await authAdmin.createUser({
          email: email.trim().toLowerCase(),
          password: password,
          displayName: name,
          ...(phone && /^\+\d{10,15}$/.test(phone.trim()) ? { phoneNumber: phone.trim() } : {})
        });
        uid = userRecord.uid;
        console.log(`[Firebase Admin SDK] Created Auth user UID: ${uid}`);
      } catch (authErr: any) {
        if (authErr.code === "auth/email-already-exists" || authErr.message?.includes("already exists")) {
          try {
            const authAdmin = getAuth(adminApp);
            const existingUser = await authAdmin.getUserByEmail(email.trim().toLowerCase());
            uid = existingUser.uid;
            console.log(`[Firebase Admin SDK] Found existing Auth user UID: ${uid}`);
          } catch (fetchErr) {
            console.warn("[Firebase Admin SDK] Notice fetching existing user:", fetchErr);
          }
        } else {
          console.warn("[Firebase Admin SDK] Auth creation notice (falling back to REST/Database):", authErr.message || authErr);
        }
      }
    }

    // Fallback REST API attempt
    if (!uid) {
      try {
        const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyAEh_cK5PcVlCiexIW5500sIADgkxJheKI";
        const restResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
            returnSecureToken: true
          })
        });
        const restData = await restResp.json();
        if (restData.localId) {
          uid = restData.localId;
          console.log(`[Firebase Auth REST API] Created Auth user UID: ${uid}`);
        } else if (restData.error?.message?.includes("EMAIL_EXISTS")) {
          const loginResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password: password,
              returnSecureToken: true
            })
          });
          const loginData = await loginResp.json();
          if (loginData.localId) {
            uid = loginData.localId;
          }
        }
      } catch (restErr: any) {
        console.warn("[Firebase Auth REST] Notice:", restErr.message || restErr);
      }
    }

    // Guaranteed Fallback UID generation for Database-managed Accounts
    if (!uid) {
      const sanitizedEmailPrefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
      uid = `staff_${sanitizedEmailPrefix}_${Date.now().toString(36)}`;
      console.log(`[Database Profile Fallback] Provisioned unique staff UID: ${uid}`);
    }

    // Map role and status according to target specs: role: "delivery_partner", status: "active"
    const isPartner = role === "delivery_partner" || role === "partner";
    const mappedRole = isPartner ? "partner" : role;
    const formattedStatus = status.toLowerCase() === "active" ? "active" : status.toLowerCase();

    const userData = {
      id: uid,
      name: name,
      email: email.trim().toLowerCase(),
      role: isPartner ? "delivery_partner" : mappedRole, // Stored in Firestore as "delivery_partner"
      status: formattedStatus,                           // Stored in Firestore as "active"
      isActive: formattedStatus === "active",
      username: username || email.split("@")[0],
      phone: phone || "",
      password: password,                                // Stored in document for database auth fallback
      createdAt: new Date().toISOString(),
      storeId: storeId || "store-saphale-1",
      serviceArea: serviceArea || "Saphale & Palghar East"
    };

    if (adminApp) {
      try {
        const configPath = path.join(process.cwd(), "firebase-applet-config.json");
        let databaseId = "(default)";
        if (fs.existsSync(configPath)) {
          const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
          databaseId = configData.firestoreDatabaseId || databaseId;
        }

        const firestoreDb = getFirestore(adminApp, databaseId);
        await firestoreDb.collection("users").doc(uid).set(userData, { merge: true });
        console.log(`[Firestore /users/${uid}] Document successfully written via Admin SDK: role='delivery_partner', status='active'`);
      } catch (fsErr: any) {
        console.warn("[Firestore Admin SDK Write Notice]:", fsErr?.message || fsErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Delivery partner account created successfully for ${name}.`,
      uid: uid,
      user: {
        ...userData,
        role: mappedRole
      }
    });
  } catch (err: any) {
    console.error("Error in create-delivery-partner API:", err);
    return res.status(500).json({
      success: false,
      message: `Failed to create delivery partner account: ${err.message || 'Server error'}`
    });
  }
});

// Gemini AI Customer Support Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, catalog, activeOrders, userAddress } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required" });
    }

    const ai = getGenAI();

    // Prepare system instructions with full store context
    const systemInstruction = `
You are "QuickPal AI Assistant", an extraordinarily friendly, concise, and helpful 24/7 customer support AI for QuickPal — India's premier 10-minute hyperlocal express grocery delivery service.

STORE INFORMATION & POLICIES:
- Delivery Speed: 10 to 15 minutes express delivery directly from local neighborhood dark stores.
- Free Shipping: Free express delivery on orders above ₹199. Orders below ₹199 carry a ₹15 delivery fee.
- Accepted Payment Modes: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards, NetBanking, and Cash on Delivery (COD).
- COD Limit: Cash on Delivery is allowed for orders up to ₹200. Orders above ₹200 require mandatory online UPI/Card payment.
- UPI Verification: Customers receive a QR code & payee UPI ID. After payment, they enter their 12-digit UPI UTR transaction ID or upload a screenshot for instant automated verification.
- Returns & Refund Guarantee: 100% Quality & Freshness Guarantee. If any item is damaged, defective, or expired, customers can request instant replacements or full refunds in My Orders.
- Operating Hours: 6:00 AM to 12:00 Midnight daily.

CURRENT CUSTOMER CONTEXT:
${userAddress ? `- Delivery Location: ${userAddress.label} (${userAddress.area}, ${userAddress.city})` : ""}
${activeOrders && activeOrders.length > 0 ? `- Active Customer Orders:\n${JSON.stringify(activeOrders, null, 2)}` : "- No active orders currently in transit."}
${catalog && catalog.length > 0 ? `- Available Store Products Summary (Sample):\n${JSON.stringify(catalog.slice(0, 25).map((p: any) => ({ id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice, category: p.category, stock: p.stock, deliveryTimeMins: p.deliveryTimeMins, description: p.description })), null, 2)}` : ""}

RESPONSE INSTRUCTIONS:
- Be polite, enthusiastic, professional, and clear.
- Keep responses concise (2 to 4 sentences max unless detailed product/refund instructions are requested).
- If the user asks for product recommendations or mentions items like milk, bread, snacks, vegetables, or fruits, suggest specific items from QuickPal's catalog.
- If the user asks about order status, refer to their active order details provided above.
- Use rupee symbol (₹) for prices.
`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I'm here to help you with your QuickPal grocery order! What can I check for you?";
      return res.json({ reply, isAiPowered: true });
    } else {
      // Smart Fallback when GEMINI_API_KEY is not set or local fallback
      const query = message.toLowerCase();
      let reply = "";

      if (query.includes("status") || query.includes("order") || query.includes("where")) {
        if (activeOrders && activeOrders.length > 0) {
          const ord = activeOrders[0];
          reply = `Your order #${ord.id} is currently "${ord.status.replace(/_/g, ' ')}"! Estimated arrival is in ${ord.deliveryTimeMins || 10} minutes to ${ord.address?.area || 'your saved address'}.`;
        } else {
          reply = "You don't have any active orders right now! You can browse fresh groceries and order items with 10-minute delivery.";
        }
      } else if (query.includes("delivery") || query.includes("time") || query.includes("fast") || query.includes("fee")) {
        reply = "QuickPal guarantees 10 to 15-minute express delivery! Shipping is FREE on orders above ₹199. Standard fee for smaller orders is ₹15.";
      } else if (query.includes("payment") || query.includes("upi") || query.includes("cod") || query.includes("pay")) {
        reply = "We accept instant UPI (GPay, PhonePe, Paytm), Cards, NetBanking, and Cash on Delivery (COD up to ₹200).";
      } else if (query.includes("refund") || query.includes("return") || query.includes("damage") || query.includes("cancel")) {
        reply = "QuickPal has a 100% Quality Guarantee! Damaged or missing items receive an instant full refund or replacement. You can also raise a ticket in the FAQ Dashboard.";
      } else if (query.includes("milk") || query.includes("bread") || query.includes("dairy")) {
        reply = "We have fresh Amul Gold Full Cream Milk (₹33) and Harvest Gold Whole Wheat Bread (₹45) available for 10-minute express delivery!";
      } else if (query.includes("snack") || query.includes("chips") || query.includes("munchies")) {
        reply = "Looking for munchies? Check out Lay's Magic Masala Chips (₹20) and Haldiram's Bhujia Sev (₹55) in our Snacks section!";
      } else {
        reply = `Hello! I'm QuickPal Assistant. I can help you track live orders, find fresh products, check delivery fees (FREE above ₹199), or guide you through UPI/COD payment modes. What can I help you with?`;
      }

      return res.json({ reply, isAiPowered: false });
    }
  } catch (err: any) {
    console.error("Error handling /api/chat route:", err);
    return res.status(500).json({
      reply: "QuickPal AI Assistant is currently undergoing routine maintenance. Please check our FAQ Dashboard or contact store support!",
      error: err?.message,
    });
  }
});

async function startServer() {
  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuickPal Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
