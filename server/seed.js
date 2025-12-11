require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to Database...');

        // 1. Clear old data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('🧹 Cleared old data...');

        // 2. Create Admin User (Using .create() to trigger encryption)
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: '123456', // This will now be encrypted automatically
            isAdmin: true,
        });

        console.log('👤 Admin User Created (Encrypted)');

        // 3. Create Products
        const products = [
            {
                user: adminUser._id, // Link to the new admin
                name: "Infuse Whey Isolate",
                brand: "Infuse",
                category: "Protein",
                description: "Premium ultra-filtered whey isolate.",
                image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=1000",
                price: 6500,       
                countInStock: 10,  
                variants: [], // Simplified for now
                rating: 0,
                numReviews: 0
            },
            {
                user: adminUser._id,
                name: "Infuse Pre-Ignite",
                brand: "Infuse",
                category: "Pre-workout",
                description: "High-stimulant pre-workout.",
                image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=1000",
                price: 2800,
                countInStock: 10,
                variants: [],
                rating: 0,
                numReviews: 0
            }
        ];

        await Product.insertMany(products);
        console.log('✅ Products Imported Successfully!');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedData();