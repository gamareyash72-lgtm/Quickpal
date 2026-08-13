import { Order } from '../types';

export function printOrderReceipt(order: Order) {
  const printWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes');
  if (!printWindow) {
    alert('Please allow pop-ups in your browser to print the order receipt.');
    return;
  }

  const itemsRowsHtml = order.items.map((item, idx) => {
    const itemTotal = item.product.price * item.quantity;
    return `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product.name}</strong>
          ${item.product.weightUnit ? `<span style="font-size: 11px; color: #6b7280; display: block;">(${item.product.weightUnit})</span>` : ''}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.product.price.toFixed(2)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>QuickPal Order Receipt #${order.id}</title>
      <style>
        @page {
          size: auto;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          background: #ffffff;
          margin: 0;
          padding: 20px;
          font-size: 13px;
          line-height: 1.4;
        }
        .receipt-card {
          max-width: 650px;
          margin: 0 auto;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #e5e7eb;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .brand-logo {
          font-size: 24px;
          font-weight: 900;
          color: #ea580c;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .tagline {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .order-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #f9fafb;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
        }
        .meta-col {
          flex: 1;
        }
        .meta-label {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 800;
        }
        .meta-val {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .section-box {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 12px 14px;
          border-radius: 8px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #ea580c;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #f3f4f6;
          color: #374151;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 800;
          padding: 8px 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .totals-table {
          width: 280px;
          margin-left: auto;
          margin-bottom: 20px;
        }
        .totals-table td {
          padding: 4px 8px;
        }
        .grand-total {
          border-top: 2px solid #111827;
          border-bottom: 2px double #111827;
          font-size: 16px;
          font-weight: 900;
          color: #ea580c;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .badge-paid {
          background: #dcfce7;
          color: #166534;
        }
        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-status {
          background: #ffedd5;
          color: #9a3412;
        }
        .footer {
          text-align: center;
          border-top: 2px dashed #e5e7eb;
          padding-top: 16px;
          margin-top: 20px;
          font-size: 11px;
          color: #6b7280;
        }
        .no-print {
          text-align: center;
          margin-bottom: 20px;
        }
        .btn-print {
          background: #ea580c;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 800;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn-print:hover {
          background: #c2410c;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .receipt-card {
            border: none;
            box-shadow: none;
            padding: 0;
            max-width: 100%;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>

      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Print Order Receipt</button>
      </div>

      <div class="receipt-card">
        <!-- Header -->
        <div class="header">
          <h1 class="brand-logo">⚡ QuickPal Express</h1>
          <div class="tagline">10-Minute Hyperlocal Express Grocery Delivery</div>
          <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
            ${order.storeInfo ? `${order.storeInfo.name} — ${order.storeInfo.area}, ${order.storeInfo.pincode}` : 'Dark Store #1 - Saphale & Palghar Express Distribution'}
          </div>
        </div>

        <!-- Order Meta Banner -->
        <div class="order-meta">
          <div class="meta-col">
            <div class="meta-label">Order Receipt No.</div>
            <div class="meta-val">#${order.id}</div>
          </div>
          <div class="meta-col" style="text-align: center;">
            <div class="meta-label">Date & Time</div>
            <div class="meta-val">${formattedDate}</div>
          </div>
          <div class="meta-col" style="text-align: right;">
            <div class="meta-label">Order Status</div>
            <div><span class="badge badge-status">${order.status.replace(/_/g, ' ')}</span></div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          <!-- Customer Box -->
          <div class="section-box">
            <div class="section-title">Customer Details</div>
            <div><strong>Name:</strong> ${order.customerName}</div>
            <div><strong>Phone:</strong> ${order.customerPhone}</div>
            <div><strong>Delivery Address:</strong> ${order.address ? `${order.address.addressLine}, ${order.address.area}, ${order.address.city} - ${order.address.pincode}` : order.deliveryLocation || 'Saved Address'}</div>
            ${order.address?.landmark ? `<div><strong>Landmark:</strong> ${order.address.landmark}</div>` : ''}
          </div>

          <!-- Payment Box -->
          <div class="section-box">
            <div class="section-title">Payment & Dispatch Info</div>
            <div><strong>Mode:</strong> ${order.paymentMethod.toUpperCase()}</div>
            <div><strong>Payment Status:</strong> <span class="badge ${order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-pending'}">${order.paymentStatus.toUpperCase()}</span></div>
            ${order.paymentTransactionId ? `<div><strong>Transaction Ref / UTR:</strong> ${order.paymentTransactionId}</div>` : ''}
            <div><strong>Delivery Agent:</strong> ${order.deliveryPartnerName || 'Assigned Express Fleet'}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="text-align: left;">Item Description</th>
              <th style="width: 60px; text-align: center;">Qty</th>
              <th style="width: 90px; text-align: right;">Rate (₹)</th>
              <th style="width: 100px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <!-- Summary Totals Table -->
        <table class="totals-table">
          <tr>
            <td style="color: #6b7280; text-align: right;">Items Subtotal:</td>
            <td style="text-align: right; font-weight: 700;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; text-align: right;">Delivery Fee:</td>
            <td style="text-align: right; font-weight: 700;">${order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : '<span style="color: #16a34a;">FREE</span>'}</td>
          </tr>
          ${order.handlingFee ? `
          <tr>
            <td style="color: #6b7280; text-align: right;">Handling & Packaging:</td>
            <td style="text-align: right; font-weight: 700;">₹${order.handlingFee.toFixed(2)}</td>
          </tr>` : ''}
          ${order.discount ? `
          <tr>
            <td style="color: #6b7280; text-align: right;">Promo Discount:</td>
            <td style="text-align: right; font-weight: 700; color: #dc2626;">-₹${order.discount.toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td class="grand-total" style="text-align: right; padding-top: 8px;">Grand Total:</td>
            <td class="grand-total" style="text-align: right; padding-top: 8px;">₹${order.total.toFixed(2)}</td>
          </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
          <p style="font-weight: 800; color: #374151; margin-bottom: 4px;">Thank you for ordering with QuickPal Express! 🛒</p>
          <p style="margin: 0;">For queries, support or returns, visit Help & Support in your app or email support@quickpal.in</p>
          <p style="margin-top: 4px; font-size: 10px; color: #9ca3af;">Computer Generated Express Tax Invoice & Order Summary</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          // Auto-trigger print dialog after render
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}
