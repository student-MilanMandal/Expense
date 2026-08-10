import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      family: 4, // Force IPv4 to prevent 21-second IPv6 network timeouts
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
    console.log('✅ Mail sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Mail send error:', error.message);
  }
};

export default mailSender;
