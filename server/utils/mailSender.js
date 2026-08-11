import nodemailer from 'nodemailer';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore
}

/**
 * Fast & Direct Email Sender
 * 1. Gmail SMTP (Delivers real OTP emails to any inbox instantly)
 * 2. Resend API (Fallback / Production API)
 */
const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER?.trim().replace(/["']/g, '');
  const mailPass = process.env.MAIL_PASS?.trim().replace(/["']/g, '');
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // 1. Primary Method: Gmail SMTP (Delivers real OTP to any inbox instantly)
  if (mailUser && mailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
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

      console.log('✅ Real OTP Email delivered via Gmail SMTP:', info.messageId);
      return info;
    } catch (smtpErr) {
      console.warn('⚠️ Gmail SMTP error, trying Resend API fallback:', smtpErr.message);
    }
  }

  // 2. Secondary Method: Resend HTTP API
  if (resendApiKey) {
    const fromAddress = process.env.SENDER_EMAIL?.trim() || 'onboarding@resend.dev';
    const formattedFrom = fromAddress.includes('<') ? fromAddress : `ExpensePilot <${fromAddress}>`;

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
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Resend API Error: ${data.message || JSON.stringify(data)}`);
    }

    console.log('✅ Email sent via Resend API:', data.id);
    return data;
  }

  throw new Error('Please set MAIL_USER & MAIL_PASS or RESEND_API_KEY in environment variables');
};

export default mailSender;