// server/server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

console.log('🔎 [server.js] MONGO_URI =>', process.env.MONGO_URI);

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authCodeRoutes = require('./routes/authCodeRoutes');
const connectRoutes = require('./routes/connectRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// ---------------------- API ROUTES ----------------------
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/authcodes', authCodeRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/admin', adminRoutes);

const rootDir = path.resolve();
app.use('/uploads', express.static(path.join(rootDir, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;

// ✅ Start server immediately
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // 🔁 Connect DB in background (Mongoose buffers queries anyway)
  connectDB()
    .then(() => {
      console.log('✅ MongoDB Connected');
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB:', err.message);
    });
});
