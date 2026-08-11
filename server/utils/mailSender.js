import nodemailer from 'nodemailer';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore
}

/**
 * Resend API Primary Email Sender with Automatic Gmail SMTP Backup
 * Optimized with fast timeouts to prevent frontend request hanging.
 */
const mailSender = async (email, title, body) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mailUser = process.env.MAIL_USER?.trim().replace(/["']/g, '');
  const mailPass = process.env.MAIL_PASS?.trim().replace(/["']/g, '');

  // 1. Primary Method: Resend.com HTTP API (Fast 3.5s timeout)
  if (resendApiKey) {
    try {
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
        signal: AbortSignal.timeout(3500),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ OTP Email sent via Resend API:', data.id);
        return data;
      }
      console.warn('⚠️ Resend API response notice:', data.message || JSON.stringify(data));
    } catch (resendErr) {
      console.warn('⚠️ Resend API fast-fallback triggered:', resendErr.message);
    }
  }

  // 2. Backup Method: Gmail SMTP (Fast connection & socket timeouts)
  if (mailUser && mailPass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"ExpensePilot" <${mailUser}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log('✅ OTP Email delivered via Gmail SMTP:', info.messageId);
    return info;
  }

  throw new Error('Please set RESEND_API_KEY or MAIL_USER & MAIL_PASS in environment variables');
};

export default mailSender;