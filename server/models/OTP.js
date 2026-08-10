import mongoose from 'mongoose';
import mailSender from '../utils/mailSender.js';
import emailTemplate from '../mail/templates/emailVerificationTemplate.js';

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60, // Document expires automatically after 5 minutes
  },
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      'Verification Email from ExpensePilot',
      emailTemplate(otp)
    );
    console.log('✅ Email sent result:', mailResponse ? mailResponse.messageId : 'Logged to console');
  } catch (error) {
    console.error('❌ Error occurred while sending email:', error.message);
    console.log(`🔑 Verification OTP for ${email}: ${otp}`);
  }
}

// Pre-save hook to send email before saving OTP document
OTPSchema.pre('save', async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model('OTP', OTPSchema);
export default OTP;
