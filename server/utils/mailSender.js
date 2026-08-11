import nodemailer from 'nodemailer';

/**
 * Multi-tier robust Email Sender:
 * 1. Resend HTTP API (Port 443 HTTPS - Primary)
 * 2. Gmail SMTP Port 587 STARTTLS (Secondary)
 * 3. Gmail SMTP Port 465 SSL (Tertiary)
 * 4. Local Dev Console Fallback (Ensures local testing never gets blocked by network timeouts)
 */
const mailSender = async (email, title, body) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mailUser = process.env.MAIL_USER?.trim().replace(/["']/g, '');
  const mailPass = process.env.MAIL_PASS?.trim().replace(/["']/g, '');
  const isDev = process.env.NODE_ENV !== 'production';

  // Tier 1: Try Resend HTTP API (HTTPS Port 443)
  if (resendApiKey) {
    try {
      const fromAddress = process.env.SENDER_EMAIL?.trim() || 'onboarding@resend.dev';
      const formattedFrom = fromAddress.includes('<') ? fromAddress : `ExpensePilot <${fromAddress}>`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      if (response.ok) {
        console.log('✅ Email sent via Resend API:', data.id);
        return data;
      }

      console.warn('⚠️ Resend API limitation/error:', data.message || JSON.stringify(data));
    } catch (resendErr) {
      console.warn('⚠️ Resend API request failed:', resendErr.message);
    }
  }

  // Tier 2: Try Gmail SMTP Port 587 (STARTTLS)
  if (mailUser && mailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
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

      console.log('✅ Email sent via Gmail SMTP Port 587:', info.messageId);
      return info;
    } catch (smtpErr) {
      console.warn('⚠️ Gmail SMTP Port 587 failed:', smtpErr.message);

      // Tier 3: Try Gmail SMTP Port 465 (SSL)
      try {
        const transporter465 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // SSL
          family: 4,
          connectionTimeout: 6000,
          greetingTimeout: 6000,
          socketTimeout: 6000,
          auth: {
            user: mailUser,
            pass: mailPass,
          },
        });

        const info465 = await transporter465.sendMail({
          from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
          to: email,
          subject: title,
          html: body,
        });

        console.log('✅ Email sent via Gmail SMTP Port 465:', info465.messageId);
        return info465;
      } catch (smtp465Err) {
        console.warn('⚠️ Gmail SMTP Port 465 failed:', smtp465Err.message);
      }
    }
  }

  // Tier 4: Development Console Fallback (Prints to terminal log so dev testing is never blocked)
  if (isDev) {
    console.log('\n==================================================');
    console.log('📩 [DEV EMAIL SIMULATOR] OTP Email Generated:');
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: ${title}`);
    console.log('==================================================\n');
    return { success: true, devMode: true };
  }

  throw new Error('Email delivery failed. Please check Resend API Key or Gmail App Password.');
};

export default mailSender;