import { EmailAlertLog, EmailAlertType, Product, SupportTicket, Order } from '../types';
import { safeJsonParse, safeLocalStorageSet } from './safeStorage';

export const OFFICIAL_SUPPORT_EMAIL = 'quickpal.in@outlook.com';

export interface DispatchAlertParams {
  type: EmailAlertType;
  subject: string;
  content: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Dispatches an automated email notification to quickpal.in@outlook.com
 * and logs it in local and remote audit stores.
 */
export async function sendAutomationEmail(params: DispatchAlertParams): Promise<EmailAlertLog> {
  const alertId = 'email-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const nowIso = new Date().toISOString();

  const newLog: EmailAlertLog = {
    id: alertId,
    type: params.type,
    recipient: OFFICIAL_SUPPORT_EMAIL,
    subject: params.subject,
    content: params.content,
    metadata: params.metadata,
    status: 'sent',
    timestamp: nowIso,
    severity: params.severity || 'medium'
  };

  // 1. Save to LocalStorage audit trail
  try {
    const existingLogs: EmailAlertLog[] = safeJsonParse('qp_email_alerts', []);
    const updatedLogs = [newLog, ...existingLogs.slice(0, 199)]; // retain last 200 alert emails
    safeLocalStorageSet('qp_email_alerts', updatedLogs);
  } catch (err) {
    console.warn('[AlertAutomation] Error saving to localStorage:', err);
  }

  // 2. Transmit to Backend Server API for real-time dispatching and logging
  try {
    fetch('/api/send-alert-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(apiErr => {
      console.warn('[AlertAutomation] Backend dispatch warning (saved locally):', apiErr);
    });
  } catch (e) {
    console.warn('[AlertAutomation] Network dispatch notice:', e);
  }

  console.log(`[Automated Email to ${OFFICIAL_SUPPORT_EMAIL}] ✉️ [${params.type}] ${params.subject}`);
  return newLog;
}

/**
 * Automated Trigger 1: Low Stock & Out-of-Stock Sentinel
 */
export function triggerLowStockEmail(product: Product, currentStock: number) {
  const isZero = currentStock <= 0;
  const severity = isZero ? 'critical' : 'high';
  const type: EmailAlertType = isZero ? 'OUT_OF_STOCK' : 'LOW_STOCK';
  const subject = isZero
    ? `🚨 [CRITICAL OUT OF STOCK] ${product.name} (0 remaining) at QuickPal Store`
    : `⚠️ [LOW STOCK WARNING] ${product.name} is running low (${currentStock} units left)`;

  const content = `
AUTOMATED INVENTORY ALERT FOR QUICKPAL STORE
=============================================
Recipient: ${OFFICIAL_SUPPORT_EMAIL}
Alert Type: ${type}
Severity: ${severity.toUpperCase()}
Timestamp: ${new Date().toLocaleString()}

PRODUCT DETAILS:
- Product Name: ${product.name}
- Product ID: ${product.id}
- Category: ${product.category}
- Remaining Stock: ${currentStock} units
- Price: ₹${product.price} (Original: ₹${product.originalPrice || product.price})
- Unit Size: ${product.weightUnit || '1 unit'}

ACTION REQUIRED:
Please replenish inventory immediately from local dark store supplier or wholesale distributor to avoid order fulfilment delays.
`;

  return sendAutomationEmail({
    type,
    subject,
    content,
    severity,
    metadata: {
      productId: product.id,
      productName: product.name,
      stockRemaining: currentStock,
      category: product.category,
      price: product.price
    }
  });
}

/**
 * Automated Trigger 2: Customer Complaint & Support Ticket Submitted
 * Automatically forwards the detailed issue description to quickpal.in@outlook.com
 */
export function triggerComplaintEmail(ticket: SupportTicket) {
  const subject = `📩 [CUSTOMER COMPLAINT] Ticket #${ticket.id}: "${ticket.subject}"`;
  const content = `
AUTOMATED CUSTOMER COMPLAINT FORWARDING SYSTEM
=============================================
Forwarded To: ${OFFICIAL_SUPPORT_EMAIL}
Alert Type: CUSTOMER_COMPLAINT
Severity: HIGH
Timestamp: ${new Date().toLocaleString()}

CUSTOMER & GRIEVANCE SUMMARY:
- Ticket Reference: #${ticket.id}
- Customer Name: ${ticket.customerName}
- Customer Email: ${ticket.customerEmail || 'Not specified'}
- Customer Phone: ${ticket.customerPhone || 'Not provided'}
- Related Order Reference: ${ticket.orderId ? '#' + ticket.orderId : 'General Store Grievance / In-App Query'}
- Subject: ${ticket.subject}
- Submission Status: ${ticket.status.toUpperCase()}

=============================================
DETAILED ISSUE DESCRIPTION:
"${ticket.message}"
=============================================

RESOLUTION SLA & ACTION REQUIRED:
1. Support executive must review the detailed customer issue above.
2. If related to an order (#${ticket.orderId || 'N/A'}), verify order packing, courier assignment, or refund status.
3. Reach out to the customer at ${ticket.customerPhone || ticket.customerEmail || 'the registered app account'} within 15 minutes.
4. Update ticket status in the QuickPal Admin Desk.
`;

  return sendAutomationEmail({
    type: 'CUSTOMER_COMPLAINT',
    subject,
    content,
    severity: 'high',
    metadata: {
      ticketId: ticket.id,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      orderId: ticket.orderId,
      subject: ticket.subject,
      detailedIssue: ticket.message
    }
  });
}

/**
 * Automated Trigger 3: Fraud & Suspicious Payment Attempt Defense
 */
export function triggerFraudAlertEmail(
  fraudType: string,
  details: {
    orderId?: string;
    utr?: string;
    amount?: number;
    customerName?: string;
    customerPhone?: string;
    reason: string;
    actor?: string;
  }
) {
  const subject = `🚨 [FRAUD ALERT BLOCKED] ${fraudType} on Order #${details.orderId || 'NEW'}`;
  const content = `
AUTOMATED FRAUD & SECURITY DEFENSE SYSTEM
=========================================
Recipient: ${OFFICIAL_SUPPORT_EMAIL}
Alert Type: FRAUD_DETECTED
Severity: CRITICAL
Timestamp: ${new Date().toLocaleString()}

SECURITY EVENT DETAILS:
- Event: ${fraudType}
- Flagged Order: #${details.orderId || 'N/A'}
- Customer Name: ${details.customerName || 'Anonymous / Guest'}
- Customer Phone: ${details.customerPhone || 'N/A'}
- Flagged Transaction / UTR: ${details.utr || 'N/A'}
- Transaction Amount: ₹${details.amount || 0}
- Block Reason: ${details.reason}
- Source Actor: ${details.actor || 'Website User'}

DEFENSE MEASURES TAKEN:
1. Automated payment gateway settlement was blocked.
2. Order flagged as FAILED / UNDER REVIEW.
3. IP and session logged in payment security audit.
4. Immediate notification dispatched to ${OFFICIAL_SUPPORT_EMAIL}.
`;

  return sendAutomationEmail({
    type: 'FRAUD_DETECTED',
    subject,
    content,
    severity: 'critical',
    metadata: details
  });
}

/**
 * Automated Trigger 4: General Security & Brute Force Alerts
 */
export function triggerSecurityAlertEmail(title: string, details: string, metadata?: Record<string, any>) {
  const subject = `🔒 [SECURITY AUDIT] ${title}`;
  const content = `
QUICKPAL AUTOMATED SECURITY AUDIT
==================================
Recipient: ${OFFICIAL_SUPPORT_EMAIL}
Alert Type: SECURITY_ALERT
Severity: HIGH
Timestamp: ${new Date().toLocaleString()}

EVENT SUMMARY:
${title}

DETAILS:
${details}
`;

  return sendAutomationEmail({
    type: 'SECURITY_ALERT',
    subject,
    content,
    severity: 'high',
    metadata
  });
}

/**
 * Automated Trigger 5: New High-Value or Express Order Placed
 */
export function triggerOrderAlertEmail(order: Order) {
  const subject = `🛒 [NEW ORDER PLACED] Order #${order.id} (₹${order.total}) - ${order.paymentMethod.toUpperCase()}`;
  const content = `
AUTOMATED NEW ORDER NOTIFICATION
=================================
Recipient: ${OFFICIAL_SUPPORT_EMAIL}
Alert Type: NEW_ORDER
Severity: MEDIUM
Timestamp: ${new Date().toLocaleString()}

ORDER SUMMARY:
- Order ID: #${order.id}
- Customer Name: ${order.customerName}
- Phone: ${order.customerPhone || 'N/A'}
- Delivery Address: ${order.deliveryAddress || order.address?.area || 'Saphale (401102)'}
- PIN Code: ${order.deliveryPincode || order.address?.pincode || '401102'}
- Total Amount: ₹${order.total} (Items Subtotal: ₹${order.subtotal})
- Payment Mode: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})
- Delivery Verification OTP: ${order.deliveryOtp || 'Generated'}

ITEMS ORDERED:
${(order.items || []).map(i => `- ${i.quantity}x ${i.product.name} (₹${i.product.price} each)`).join('\n')}

ESTIMATED DELIVERY: 10 to 15 minutes.
`;

  return sendAutomationEmail({
    type: 'NEW_ORDER',
    subject,
    content,
    severity: 'medium',
    metadata: {
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total,
      paymentMethod: order.paymentMethod,
      itemsCount: order.items?.length
    }
  });
}
