// server/server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ================== BASIC MIDDLEWARE ==================
app.use(express.json());

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ================== LOGGER ==================
app.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});

// ================== ROUTES ==================
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authCodeRoutes = require('./routes/authCodeRoutes');
const connectRoutes = require('./routes/connectRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/authcodes', authCodeRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/admin', adminRoutes);

// ================== HEALTH ==================
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(' ERROR:', err.message);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    console.log(' MongoDB Connected');
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(' DB Error:', err.message);
    process.exit(1);
  }
})();
