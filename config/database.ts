import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is missing from .env');
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;