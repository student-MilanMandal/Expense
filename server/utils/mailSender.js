import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  if (!mailUser || !mailPass) {
    console.error('❌ SMTP Error: MAIL_USER or MAIL_PASS environment variables are missing on the server.');
    return null;
  }

  // Attempt 1: Standard Gmail Service with strict 5s connection timeout
  try {
    let transporter1 = nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info1 = await transporter1.sendMail({
      from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log('✅ Mail sent successfully (service: gmail):', info1.messageId);
    return info1;
  } catch (err1) {
    console.warn('⚠️ Gmail service transport failed, trying fallback to explicit SMTP port 587...', err1.message);

    // Attempt 2: Explicit SMTP Host Port 587 STARTTLS (Render Cloud Compatible)
    try {
      const host = process.env.MAIL_HOST || 'smtp.gmail.com';
      const port = Number(process.env.MAIL_PORT) || 587;

      let transporter2 = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        requireTLS: true,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
        auth: {
          user: mailUser,
          pass: mailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      let info2 = await transporter2.sendMail({
        from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
        to: `${email}`,
        subject: `${title}`,
        html: `${body}`,
      });

      console.log('✅ Mail sent successfully (explicit SMTP 587):', info2.messageId);
      return info2;
    } catch (err2) {
      console.error('❌ Both Gmail service and explicit SMTP transports failed:', err2.message);
      return null;
    }
  }
};

export default mailSender;
