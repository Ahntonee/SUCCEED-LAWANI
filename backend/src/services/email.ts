import nodemailer from 'nodemailer';

// ─── Transporter ──────────────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || '"Succeed Michael Lawani" <hello@succeedlawani.com>';

// ─── Order Confirmation Email ─────────────────────────────────────────────────
interface OrderItem { name: string; price: number; qty: number; image?: string; }

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentRef: string;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('⚠️  Email not sent: SMTP credentials not configured.');
    return;
  }

  const itemRows = data.items.map((item) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
        <strong style="color:#0f172a;font-size:14px;">${item.name}</strong>
        <div style="color:#64748b;font-size:12px;margin-top:2px;">Qty: ${item.qty}</div>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;color:#0d9488;font-weight:700;font-size:14px;">
        ₦${(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0f172a;border-radius:24px 24px 0 0;padding:32px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;background:#0d9488;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:white;font-weight:900;font-size:24px;">S</span>
            </div>
          </div>
          <h1 style="color:white;margin:16px 0 4px;font-size:22px;font-weight:900;">Order Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px;">Thank you for your purchase</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:32px;">

          <p style="color:#0f172a;font-size:16px;margin:0 0 8px;">Hi <strong>${data.customerName}</strong>,</p>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 28px;">
            Your order <strong style="color:#0d9488;">#${data.orderId}</strong> has been confirmed and is being processed.
            Here's a summary of what you ordered:
          </p>

          <!-- Order Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:24px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:12px 16px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
                <th style="padding:12px 16px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background:#f8fafc;">
                <td style="padding:16px;font-weight:800;font-size:16px;color:#0f172a;">Total</td>
                <td style="padding:16px;font-weight:800;font-size:18px;color:#0d9488;text-align:right;">₦${data.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Payment Info -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:28px;">
            <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">✅ Payment Successful</p>
            <p style="margin:4px 0 0;font-size:12px;color:#15803d;">
              Method: <strong>${data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)}</strong>
              &nbsp;·&nbsp; Ref: <strong>${data.paymentRef}</strong>
            </p>
          </div>

          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">
            We'll notify you once your order has been shipped. If you have any questions,
            feel free to reach out to us.
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:8px;">
            <a href="${process.env.FRONTEND_URL || 'https://succeed-lawani.vercel.app'}/shop"
              style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:0.02em;">
              Continue Shopping
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-radius:0 0 24px 24px;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            © ${new Date().getFullYear()} Succeed Michael Lawani &nbsp;·&nbsp;
            <a href="mailto:hello@succeedlawani.com" style="color:#0d9488;text-decoration:none;">hello@succeedlawani.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to: data.customerEmail,
    subject: `Order Confirmed #${data.orderId} — Succeed Michael Lawani`,
    html,
  });

  console.log(`✅ Order confirmation sent to ${data.customerEmail}`);
}
