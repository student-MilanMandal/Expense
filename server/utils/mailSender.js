import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
  const mailUser = process.env.MAIL_USER ? process.env.MAIL_USER.trim().replace(/["']/g, '') : '';
  const mailPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.trim().replace(/["']/g, '') : '';

  if (!mailUser || !mailPass) {
    const missingMsg = 'SMTP credentials (MAIL_USER / MAIL_PASS) are missing on Render Environment Variables.';
    console.error(`❌ SMTP Error: ${missingMsg}`);
    throw new Error(missingMsg);
  }

  // Method 1: Gmail Service with explicit IPv4 family forcing (bypasses Render IPv6 DNS timeouts)
  try {
    let transporter1 = nodemailer.createTransport({
      service: 'gmail',
      family: 4, // Force IPv4 socket connection on Linux cloud containers
      connectionTimeout: 8000,
      greetingTimeout: 8000,
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

    console.log('✅ Gmail Mail sent successfully (Method 1 - Service IPv4):', info1.messageId);
    return info1;
  } catch (err1) {
    console.warn('⚠️ Method 1 failed, trying Method 2 (Port 465 SSL IPv4):', err1.message);

    // Method 2: Direct SSL Port 465 with IPv4 family forcing
    try {
      let transporter2 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
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

      console.log('✅ Gmail Mail sent successfully (Method 2 - Port 465 SSL):', info2.messageId);
      return info2;
    } catch (err2) {
      console.warn('⚠️ Method 2 failed, trying Method 3 (Port 587 STARTTLS IPv4):', err2.message);

      // Method 3: STARTTLS Port 587 with IPv4 family forcing
      try {
        let transporter3 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          family: 4,
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
          auth: {
            user: mailUser,
            pass: mailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        let info3 = await transporter3.sendMail({
          from: `"ExpensePilot Smart Expense Tracker" <${mailUser}>`,
          to: `${email}`,
          subject: `${title}`,
          html: `${body}`,
        });

        console.log('✅ Gmail Mail sent successfully (Method 3 - Port 587):', info3.messageId);
        return info3;
      } catch (err3) {
        console.error('❌ All 3 Gmail SMTP methods failed:', err3.message);
        throw new Error(`Gmail SMTP delivery failed: ${err3.message || 'Connection timeout'}`);
      }
    }
  }
};

export default mailSender;
