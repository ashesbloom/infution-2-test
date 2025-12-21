require('dotenv').config();
const mongoose = require('mongoose');
const AuthCode = require('./models/AuthCode');

// Helper function to generate random 12-char alphanumeric code
const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const seedAuthCodes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to Database...');

        // Clear existing auth codes
        await AuthCode.deleteMany({});
        console.log('🧹 Cleared old auth codes...');

        // Generate 100 unique random codes
        const authCodes = [];
        const usedCodes = new Set();
        
        while (authCodes.length < 100) {
            const code = generateRandomCode();
            if (!usedCodes.has(code)) {
                usedCodes.add(code);
                authCodes.push({ code, isUsed: false });
            }
        }
        
        await AuthCode.insertMany(authCodes);
        
        console.log(`🔑 ${authCodes.length} Auth Codes Created Successfully!`);
        console.log('');
        console.log('📋 Sample codes:');
        authCodes.slice(0, 10).forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.code}`);
        });
        console.log('   ...');
        console.log(`   (and ${authCodes.length - 10} more)`);
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedAuthCodes();
