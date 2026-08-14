import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Mail sender utility for OTP and notifications
 * Supports Resend (Primary) with Gmail SMTP as fallback.
 *
 * @param {string} email - Recipient email address
 * @param {string} title - Email subject
 * @param {string} body - HTML email body
 */
const mailSender = async (email, title, body) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim() || 'ExpensePilot <onboarding@resend.dev>';

  // 1. Resend Email Delivery (Primary)
  if (resendApiKey && resendApiKey !== 're_your_resend_api_key_here') {
    try {
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: resendFrom,
        to: [email],
        subject: title,
        html: body,
      });

      if (error) {
        console.error('❌ Resend API error:', error.message || error);
        throw new Error(error.message || 'Failed to send email via Resend');
      }

      console.log(`✅ Email delivered via Resend to ${email} (ID: ${data?.id})`);
      return data;
    } catch (err) {
      console.warn('⚠️ Resend failed, attempting fallback if available:', err.message);
      // If no SMTP fallback is configured, rethrow the Resend error
      if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        throw err;
      }
    }
  }

  // 2. Gmail SMTP Backup (Fallback)
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS?.trim().replace(/\s+/g, '');

  if (mailUser && mailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"ExpensePilot" <${mailUser}>`,
        to: email,
        subject: title,
        html: body,
      });

      console.log(`✅ Email delivered via Gmail SMTP to ${email} (ID: ${info.messageId})`);
      return info;
    } catch (smtpErr) {
      console.error('❌ Gmail SMTP error:', smtpErr.message);
      throw smtpErr;
    }
  }

  // If no email service is configured
  console.warn('⚠️ No email service configured. Please add RESEND_API_KEY in your .env file.');
  throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
};

export default mailSender;