const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔎 [db.js] MONGO_URI =>', process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // ✅ For newer mongoose versions (v7+), just pass the URI
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
