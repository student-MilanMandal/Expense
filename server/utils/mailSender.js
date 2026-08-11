import nodemailer from 'nodemailer';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Ignore DNS configuration errors
}

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS?.trim();

  if (!mailUser || !mailPass) {
    throw new Error(
      'MAIL_USER and MAIL_PASS are not configured'
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: mailUser,
        pass: mailPass,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"ExpensePilot" <${mailUser}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log(
      `✅ Email sent successfully: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
    });

    throw new Error(
      'Unable to send email. Please try again later.'
    );
  }
};

export default mailSender;