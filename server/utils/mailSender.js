import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER ? process.env.MAIL_USER.trim().replace(/["']/g, '') : '';
  const mailPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.trim().replace(/["']/g, '') : '';

  if (!mailUser || !mailPass) {
    const missingMsg = 'SMTP credentials (MAIL_USER / MAIL_PASS) are missing in Render Environment Variables.';
    console.error(`❌ SMTP Error: ${missingMsg}`);
    throw new Error(missingMsg);
  }

  // Attempt 1: Gmail Port 465 Direct SSL (Most reliable for Render Linux containers)
  try {
    let transporter1 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 10000,
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

    console.log('✅ Mail sent successfully (Port 465 SSL):', info1.messageId);
    return info1;
  } catch (err1) {
    console.warn('⚠️ Port 465 SSL transport failed, attempting fallback to service gmail:', err1.message);

    // Attempt 2: Fallback Service Gmail / STARTTLS Port 587
    try {
      let transporter2 = nodemailer.createTransport({
        service: 'gmail',
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 10000,
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

      console.log('✅ Mail sent successfully (Service Gmail):', info2.messageId);
      return info2;
    } catch (err2) {
      console.error('❌ Both Gmail SMTP transports failed on server:', err2.message);
      throw new Error(`Email Delivery Failed: ${err2.message || 'SMTP Server Error'}`);
    }
  }
};

export default mailSender;
