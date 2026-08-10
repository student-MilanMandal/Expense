import mongoose from 'mongoose';

export const connect = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URL || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB connection string is not configured.'
      );
    }

    await mongoose.connect(mongoUri);

    console.log('====================================================');
    console.log('✅ DB CONNECTION SUCCESSFUL');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ DB Connection Failed:', error.message);
    process.exit(1);
  }
};

export default connect;