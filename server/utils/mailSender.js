import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  try {
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;

    if (!mailUser || !mailPass) {
      console.warn('⚠️ SMTP mail credentials (MAIL_USER / MAIL_PASS) are missing on server environment variables.');
      return null;
    }

    const host = process.env.MAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.MAIL_PORT) || 587;

    let transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465, // true for 465, false for 587
      requireTLS: true,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents SSL certificate handshake issues on cloud containers like Render
      },
    });

    let info = await transporter.sendMail({
      from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log('✅ Cloud Mail sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Cloud Mail send error:', error.message || error);
    return null;
  }
};

export default mailSender;
