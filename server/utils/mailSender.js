import nodemailer from 'nodemailer';

/**
 * Resend Email Sender (Primary) with automatic Gmail SMTP fallback and strict timeouts
 */
const mailSender = async (email, title, body) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mailUser = process.env.MAIL_USER?.trim().replace(/["']/g, '');
  const mailPass = process.env.MAIL_PASS?.trim().replace(/["']/g, '');

  // 1. Primary Method: Resend HTTP API (Recommended for Render, uses HTTPS Port 443)
  if (resendApiKey) {
    try {
      const fromAddress = process.env.SENDER_EMAIL?.trim() || 'onboarding@resend.dev';
      const formattedFrom = fromAddress.includes('<') ? fromAddress : `ExpensePilot <${fromAddress}>`;

      // 5 second timeout for Resend API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: formattedFrom,
          to: [email],
          subject: title,
          html: body,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }

      console.log('✅ Email sent via Resend API:', data.id);
      return data;
    } catch (resendErr) {
      console.warn('⚠️ Resend API timeout/limitation, falling back to Gmail SMTP:', resendErr.message);
      if (!mailUser || !mailPass) {
        throw new Error(`Resend API Error: ${resendErr.message}`);
      }
    }
  }

  // 2. Fallback Method: Gmail SMTP with 6-second socket timeout
  if (!mailUser || !mailPass) {
    throw new Error('Please set RESEND_API_KEY or MAIL_USER/MAIL_PASS in environment variables');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 6000,
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  const info = await transporter.sendMail({
    from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
    to: email,
    subject: title,
    html: body,
  });

  console.log('✅ Email sent via Gmail SMTP:', info.messageId);
  return info;
};

export default mailSender;