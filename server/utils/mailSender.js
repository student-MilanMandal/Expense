import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('⚠️ SMTP mail credentials (MAIL_USER / MAIL_PASS) are missing on server.');
      return null;
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      family: 4, // Force IPv4 to prevent 21-second IPv6 network timeouts
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"ExpensePilot Smart Expense Tracker" <${process.env.MAIL_USER}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    return info;

  } catch (error) {
    console.error('❌ Mail send error:', error.message);
    return null;
  }
};

export default mailSender;
