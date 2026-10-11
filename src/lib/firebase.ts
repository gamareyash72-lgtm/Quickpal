import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  runTransaction 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Locked to quickpal-new project
const defaultQuickPalConfig = {
  apiKey: "AIzaSyB2nMD9yBHGC3zEEu84Scd8kLbi_c-xA6I",
  authDomain: "quickpal-new.firebaseapp.com",
  projectId: "quickpal-new",
  storageBucket: "quickpal-new.firebasestorage.app",
  messagingSenderId: "22011928007",
  appId: "1:22011928007:web:e4a2142955fbaf6eaf0de2",
  measurementId: "G-8EGP5NZ3QR"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultQuickPalConfig.apiKey || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultQuickPalConfig.authDomain || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultQuickPalConfig.projectId || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultQuickPalConfig.storageBucket || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultQuickPalConfig.messagingSenderId || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultQuickPalConfig.appId || firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function to create new user accounts by Admin/Owner without logging out current session
export async function createSecondaryAuthUser(email: string, pass: string) {
  try {
    const secondaryApp = getApps().find(a => a.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    await signOut(secondaryAuth);
    return userCredential.user;
  } catch (err: any) {
    console.warn("[Firebase Auth] Secondary Auth Notice:", err?.message || err);
    return null;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction
};
export type { FirebaseUser };
