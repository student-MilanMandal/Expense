import nodemailer from 'nodemailer';

/**
 * Resend Email Sender (Primary) with Gmail SMTP fallback
 */
const mailSender = async (email, title, body) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // 1. Primary Method: Resend HTTP API (Recommended for Render, uses HTTPS Port 443)
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

    console.log('✅ OTP email sent via Resend API:', data.id);
    return data;
  }

  // 2. Fallback Method: Gmail SMTP
  const mailUser = process.env.MAIL_USER?.trim().replace(/["']/g, '');
  const mailPass = process.env.MAIL_PASS?.trim().replace(/["']/g, '');

  if (!mailUser || !mailPass) {
    throw new Error('Please set RESEND_API_KEY or MAIL_USER/MAIL_PASS in environment variables');
  }

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

  console.log('✅ OTP email sent via Gmail SMTP:', info.messageId);
  return info;
};

export default mailSender;