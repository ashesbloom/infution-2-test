require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
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

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to Database...');

        // // 1. Clear old data
        // await Product.deleteMany({});
        // await User.deleteMany({});
        // console.log('🧹 Cleared old data...');

        // 2. Create Admin User
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: '123456',
            isAdmin: true,
        });

        console.log('👤 Admin User Created');

        // 3. Demo Products for Multi-Brand Marketplace
        const products = [
            // ==================== MUSCLEBLAZE ====================
            {
                user: adminUser._id,
                name: "MuscleBlaze Biozyme Whey Protein",
                brand: "MuscleBlaze",
                category: "Protein",
                description: "India's first clinically tested whey protein with Enhanced Absorption Formula. 25g protein per serving.",
                image: "https://cdn.shopify.com/s/files/1/0639/8378/0020/files/Desc-mbperformacewhey-footer.png?v=1738930177",
                price: 4499,
                countInStock: 25,
                weight: "2 kg",
                rating: 4.5,
                numReviews: 1240
            },
            {
                user: adminUser._id,
                name: "MuscleBlaze Creatine Monohydrate",
                brand: "MuscleBlaze",
                category: "Creatine",
                description: "Micronized creatine for better absorption. Increases strength and power output.",
                image: "https://img8.hkrtcdn.com/35711/prd_3571057-MuscleBlaze-Creatine-Monohydrate-CreAMP-0.22-lb-Unflavoured_o.jpg",
                price: 799,
                countInStock: 50,
                weight: "250 g",
                rating: 4.3,
                numReviews: 856
            },
            {
                user: adminUser._id,
                name: "MuscleBlaze Mass Gainer XXL",
                brand: "MuscleBlaze",
                category: "Mass Gainer",
                description: "High-calorie mass gainer with 60g protein and 180g carbs per serving for serious gains.",
                image: "https://m.media-amazon.com/images/I/71cEjA2vOBL.jpg",
                price: 2899,
                countInStock: 15,
                weight: "3 kg",
                rating: 4.2,
                numReviews: 623
            },
            {
                user: adminUser._id,
                name: "MuscleBlaze Pre Workout Spark",
                brand: "MuscleBlaze",
                category: "Pre-workout",
                description: "Explosive energy with 200mg caffeine, beta-alanine, and citrulline for intense workouts.",
                image: "https://m.media-amazon.com/images/I/81ZEPbWGSjL._AC_UF1000,1000_QL80_.jpg",
                price: 1299,
                countInStock: 30,
                weight: "300 g",
                rating: 4.4,
                numReviews: 412
            },

            // ==================== AVVATAR ====================
            {
                user: adminUser._id,
                name: "Avvatar Absolute 100% Whey Protein",
                brand: "Avvatar",
                category: "Protein",
                description: "100% vegetarian whey from grass-fed cows. 24g protein with no added sugar.",
                image: "https://www.supplementsvilla.com/uploads/uploads/63fc58a0d4be9.png",
                price: 3999,
                countInStock: 20,
                weight: "1 kg",
                rating: 4.6,
                numReviews: 534
            },
            {
                user: adminUser._id,
                name: "Avvatar Creatine Monohydrate",
                brand: "Avvatar",
                category: "Creatine",
                description: "Pure micronized creatine for enhanced muscle strength and recovery.",
                image: "https://m.media-amazon.com/images/I/71+rzctrVQL.jpg",
                price: 899,
                countInStock: 40,
                weight: "300 g",
                rating: 4.4,
                numReviews: 287
            },
            {
                user: adminUser._id,
                name: "Avvatar Mass Gainer",
                brand: "Avvatar",
                category: "Mass Gainer",
                description: "Clean mass gainer with complex carbs and premium whey protein.",
                image: "https://www.avvatarindia.com/images/product_images/1697525196_FOP.jpg",
                price: 2499,
                countInStock: 12,
                weight: "3 kg",
                rating: 4.3,
                numReviews: 198
            },
            {
                user: adminUser._id,
                name: "Avvatar Pre Workout Energy",
                brand: "Avvatar",
                category: "Pre-workout",
                description: "Clean energy formula with natural caffeine and L-arginine.",
                image: "https://via.placeholder.com/400x400/1a1a1a/ffd700?text=Avvatar+PreWO",
                price: 1199,
                countInStock: 25,
                weight: "200 g",
                rating: 4.2,
                numReviews: 156
            },

            // ==================== OPTIMUM NUTRITION ====================
            {
                user: adminUser._id,
                name: "ON Gold Standard 100% Whey",
                brand: "Optimum Nutrition",
                category: "Protein",
                description: "World's best-selling whey protein. 24g protein with 5.5g BCAAs per serving.",
                image: "https://m.media-amazon.com/images/I/71f+UBXh2vL._AC_UF1000,1000_QL80_.jpg",
                price: 5499,
                countInStock: 18,
                weight: "2 lbs",
                rating: 4.8,
                numReviews: 3421
            },
            {
                user: adminUser._id,
                name: "ON Micronized Creatine Powder",
                brand: "Optimum Nutrition",
                category: "Creatine",
                description: "Creapure creatine monohydrate for maximum purity and potency.",
                image: "https://www.optimumnutrition.co.in/cdn/shop/files/1118952.webp?v=1763959031&width=1445",
                price: 1299,
                countInStock: 35,
                weight: "300 g",
                rating: 4.7,
                numReviews: 1876
            },
            {
                user: adminUser._id,
                name: "ON Serious Mass Gainer",
                brand: "Optimum Nutrition",
                category: "Mass Gainer",
                description: "Ultimate weight gain formula with 1250 calories and 50g protein per serving.",
                image: "https://via.placeholder.com/400x400/1a1a1a/c9a227?text=ON+Mass",
                price: 4299,
                countInStock: 10,
                weight: "6 lbs",
                rating: 4.5,
                numReviews: 2134
            },
            {
                user: adminUser._id,
                name: "ON Gold Standard Pre-Workout",
                brand: "Optimum Nutrition",
                category: "Pre-workout",
                description: "175mg caffeine with creatine, beta-alanine, and citrulline malate.",
                image: "https://via.placeholder.com/400x400/1a1a1a/c9a227?text=ON+PreWO",
                price: 2199,
                countInStock: 22,
                weight: "300 g",
                rating: 4.6,
                numReviews: 987
            },

            // ==================== MY FITNESS ====================
            {
                user: adminUser._id,
                name: "MyFitness Peanut Butter Whey",
                brand: "My Fitness",
                category: "Protein",
                description: "Delicious peanut butter flavored whey protein. 22g protein per serving.",
                image: "https://m.media-amazon.com/images/I/61lUVppTluL.jpg",
                price: 1999,
                countInStock: 30,
                weight: "1 kg",
                rating: 4.1,
                numReviews: 312
            },
            {
                user: adminUser._id,
                name: "MyFitness Creatine",
                brand: "My Fitness",
                category: "Creatine",
                description: "Affordable creatine monohydrate for strength gains.",
                image: "https://via.placeholder.com/400x400/1a1a1a/8b4513?text=MyFit+Creatine",
                price: 599,
                countInStock: 45,
                weight: "250 g",
                rating: 4.0,
                numReviews: 189
            },

            // ==================== AS-IT-IS ====================
            {
                user: adminUser._id,
                name: "AS-IT-IS Whey Protein Concentrate",
                brand: "AS-IT-IS",
                category: "Protein",
                description: "Raw, unflavored whey protein concentrate. No additives, pure protein.",
                image: "https://m.media-amazon.com/images/I/71rDa0LLphL.jpg",
                price: 1799,
                countInStock: 35,
                weight: "1 kg",
                rating: 4.4,
                numReviews: 567
            },
            {
                user: adminUser._id,
                name: "AS-IT-IS Creatine Monohydrate",
                brand: "AS-IT-IS",
                category: "Creatine",
                description: "Pure unflavored creatine with no fillers or additives.",
                image: "https://via.placeholder.com/400x400/1a1a1a/228b22?text=ASITIS+Creatine",
                price: 649,
                countInStock: 60,
                weight: "250 g",
                rating: 4.5,
                numReviews: 723
            },
            {
                user: adminUser._id,
                name: "AS-IT-IS Mass Gainer",
                brand: "AS-IT-IS",
                category: "Mass Gainer",
                description: "Clean calories with complex carbs and whey protein blend.",
                image: "https://via.placeholder.com/400x400/1a1a1a/228b22?text=ASITIS+Mass",
                price: 1899,
                countInStock: 15,
                weight: "3 kg",
                rating: 4.2,
                numReviews: 234
            },

            // ==================== DOCTOR'S CHOICE ====================
            {
                user: adminUser._id,
                name: "Doctor's Choice Isolate Whey",
                brand: "Doctor's Choice",
                category: "Protein",
                description: "Pharmaceutical grade whey isolate with digestive enzymes.",
                image: "https://cdn.nutrabay.com/wp-content/uploads/2023/11/NB-DRC-1016-07-01.jpg",
                price: 3299,
                countInStock: 20,
                weight: "1 kg",
                rating: 4.3,
                numReviews: 298
            },
            {
                user: adminUser._id,
                name: "Doctor's Choice Creatine HCL",
                brand: "Doctor's Choice",
                category: "Creatine",
                description: "Advanced creatine HCL for better absorption and no bloating.",
                image: "https://via.placeholder.com/400x400/1a1a1a/9932cc?text=DC+Creatine",
                price: 999,
                countInStock: 25,
                weight: "100 g",
                rating: 4.4,
                numReviews: 167
            },
            {
                user: adminUser._id,
                name: "Doctor's Choice Pre-Workout Extreme",
                brand: "Doctor's Choice",
                category: "Pre-workout",
                description: "High-stimulant formula with nootropics for focus and energy.",
                image: "https://via.placeholder.com/400x400/1a1a1a/9932cc?text=DC+PreWO",
                price: 1499,
                countInStock: 18,
                weight: "300 g",
                rating: 4.2,
                numReviews: 145
            },

            // ==================== ACCESSORIES ====================
            {
                user: adminUser._id,
                name: "Premium Protein Shaker Bottle",
                brand: "Nutry Health",
                category: "Accessories",
                description: "700ml leak-proof shaker with mixing ball. BPA-free plastic.",
                image: "https://beastlife.in/cdn/shop/files/02_1a43815d-9d47-4dde-b3bb-2213f5eb8c85.jpg?v=1737448224",
                price: 299,
                countInStock: 100,
                weight: "200 g",
                rating: 4.3,
                numReviews: 456
            },
            {
                user: adminUser._id,
                name: "Gym Training Gloves",
                brand: "Nutry Health",
                category: "Accessories",
                description: "Breathable workout gloves with wrist support. Anti-slip grip.",
                image: "https://sppartos.com/cdn/shop/files/8903_20_1_1200x1200.jpg?v=1756016113",
                price: 599,
                countInStock: 50,
                weight: "150 g",
                rating: 4.1,
                numReviews: 234
            },
            {
                user: adminUser._id,
                name: "Resistance Bands Set",
                brand: "Nutry Health",
                category: "Accessories",
                description: "5 resistance levels for home workouts. Includes carry bag.",
                image: "https://cdn01.pharmeasy.in/dam/products_otc/C25244/zustle-resistance-bands-set-of-12-6.01-1724414070.jpg",
                price: 799,
                countInStock: 40,
                weight: "300 g",
                rating: 4.4,
                numReviews: 187
            },
            {
                user: adminUser._id,
                name: "Gym Duffle Bag",
                brand: "Nutry Health",
                category: "Accessories",
                description: "Spacious gym bag with shoe compartment and wet pocket.",
                image: "https://m.media-amazon.com/images/I/71VH9kFMm8L._AC_UY1100_.jpg",
                price: 1299,
                countInStock: 25,
                weight: "500 g",
                rating: 4.5,
                numReviews: 312
            }
        ];

        await Product.insertMany(products);
        console.log(`✅ ${products.length} Products Imported Successfully!`);

        // 4. Seed 100 Authentication Codes
        await AuthCode.deleteMany({});
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
        console.log(`🔑 ${authCodes.length} Auth Codes Created!`);
        console.log('   Sample codes:', authCodes.slice(0, 5).map(c => c.code).join(', '));

        console.log('');
        console.log('📊 Summary:');
        console.log('   - MuscleBlaze: 4 products');
        console.log('   - Avvatar: 4 products');
        console.log('   - Optimum Nutrition: 4 products');
        console.log('   - My Fitness: 2 products');
        console.log('   - AS-IT-IS: 3 products');
        console.log("   - Doctor's Choice: 3 products");
        console.log('   - Accessories: 6 products');
        console.log('');
        console.log('🔐 Admin Login:');
        console.log('   Email: admin@example.com');
        console.log('   Password: 123456');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedData();