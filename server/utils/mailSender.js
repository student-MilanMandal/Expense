import nodemailer from 'nodemailer';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Ignore
}

// Custom IPv4-only DNS lookup function to prevent ENETUNREACH IPv6 errors
const ipv4Lookup = (hostname, options, callback) => {
  return dns.lookup(hostname, { family: 4 }, callback);
};

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS?.trim().replace(/\s+/g, '');
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // 1. Primary Method: Gmail SMTP Port 465 (SSL) with Forced IPv4 Lookup
  if (mailUser && mailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        lookup: ipv4Lookup,
        auth: {
          user: mailUser,
          pass: mailPass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      const info = await transporter.sendMail({
        from: `"ExpensePilot" <${mailUser}>`,
        to: email,
        subject: title,
        html: body,
      });

      console.log('✅ Gmail SMTP (Port 465) Result:', info.messageId);
      return info;
    } catch (smtpErr) {
      console.warn('⚠️ Gmail SMTP (Port 465) failed, trying Port 587 fallback:', smtpErr.message);

      // Fallback: Gmail SMTP Port 587 (STARTTLS) with Forced IPv4 Lookup
      try {
        const transporter587 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          lookup: ipv4Lookup,
          auth: {
            user: mailUser,
            pass: mailPass,
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        });

        const info587 = await transporter587.sendMail({
          from: `"ExpensePilot" <${mailUser}>`,
          to: email,
          subject: title,
          html: body,
        });

        console.log('✅ Gmail SMTP (Port 587) Result:', info587.messageId);
        return info587;
      } catch (smtp587Err) {
        console.warn('⚠️ Gmail SMTP (Port 587) failed:', smtp587Err.message);
      }
    }
  }

  // 2. Secondary Fallback Method: Resend HTTP API
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
        signal: AbortSignal.timeout(4000),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ Resend API Result:', data.id);
        return data;
      }
      console.warn('⚠️ Resend API response notice:', data.message || JSON.stringify(data));
    } catch (resendErr) {
      console.warn('⚠️ Resend API fetch error:', resendErr.message);
    }
  }

  throw new Error('All email delivery attempts failed. Please check network connectivity and SMTP configuration.');
};

export default mailSender;