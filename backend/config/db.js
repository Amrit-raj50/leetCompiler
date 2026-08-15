import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('ℹ️ No MONGO_URI provided. Running compiler in Standalone/Hybrid mode without database.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    console.log(`✅ MongoDB Connected for Integrated Mode: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection error: ${error.message}. Running in Standalone mode.`);
    isConnected = false;
    return false;
  }
};

export const isDbConnected = () => isConnected;
