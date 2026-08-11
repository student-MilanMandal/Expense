import nodemailer from 'nodemailer';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Ignore
}

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS
    ?.trim()
    .replace(/\s+/g, '');

  if (!mailUser || !mailPass) {
    throw new Error(
      'MAIL_USER and MAIL_PASS are not configured'
    );
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    // Force IPv4
    family: 4,

    auth: {
      user: mailUser,
      pass: mailPass,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    const info = await transporter.sendMail({
      from: `"ExpensePilot" <${mailUser}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log('✅ Gmail SMTP RESULT:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error('❌ Gmail SMTP ERROR:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    // IMPORTANT:
    // Do not silently continue when email fails.
    throw error;
  }
};

export default mailSender;