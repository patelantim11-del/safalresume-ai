import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set to send emails");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendResetEmail(to: string, resetUrl: string) {
  const t = getTransporter();

  const subject = "Reset your SafalResume AI password";
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6f8; margin:0; padding:0; }
        .container { max-width:600px; margin:24px auto; background:#ffffff; border-radius:8px; padding:24px; }
        .btn { display:inline-block; background:#0ea5e9; color:#ffffff; padding:12px 20px; border-radius:6px; text-decoration:none; }
        .footer { color:#8b8f94; font-size:12px; margin-top:16px }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 style="margin:0 0 8px 0;">SafalResume AI — Password reset</h2>
        <p style="margin:0 0 16px 0; color:#374151">You requested to reset your SafalResume AI password. Click the button below to set a new password. This link will expire in 15 minutes.</p>
        <p style="margin:18px 0;"><a class="btn" href="${resetUrl}">Reset your password</a></p>
        <p style="margin:0 0 8px 0; color:#374151">If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all; color:#0b6fb3">${resetUrl}</p>
        <div class="footer">If you did not request this, you can safely ignore this email.</div>
      </div>
    </body>
  </html>
  `;

  const text = `Reset your password: ${resetUrl}\nThis link expires in 15 minutes.`;

  const info = await t.sendMail({
    from: `${process.env.EMAIL_FROM_NAME || "SafalResume AI"} <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}

export async function sendPasswordChangedEmail(to: string) {
  const t = getTransporter();
  const subject = "Your SafalResume AI password was changed";
  const html = `
  <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;border-radius:8px;">
      <h3 style="margin-top:0;">Password changed</h3>
      <p>If you changed your password, you can safely ignore this message. If you did not, please contact support immediately.</p>
    </div>
  </div>
  `;
  const text =
    "Your SafalResume AI password was changed. If you did not perform this action, contact support.";
  const info = await t.sendMail({
    from: `${process.env.EMAIL_FROM_NAME || "SafalResume AI"} <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}
