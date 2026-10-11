/**
 * BakeUrCurl — Seed Script
 *
 * Populates the database with:
 *   - 1 Admin user   (admin@BakeUrCurl.com / Admin@123)
 *   - 2 Staff members
 *   - 8 Curly-hair-specific services
 *   - 5 Retail products
 *
 * Usage:
 *   node seed/seedData.js          — seed (skip if data exists)
 *   node seed/seedData.js --fresh  — wipe and re-seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Service = require('../models/Service');
const Product = require('../models/Product');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@BakeUrCurl.com',
    password: 'Admin@123',
    phone: '+1-555-000-0001',
    role: 'admin',
    bio: 'BakeUrCurl platform administrator.',
    isActive: true,
  },
  {
    name: 'Zara Thompson',
    email: 'zara@BakeUrCurl.com',
    password: 'Staff@123',
    phone: '+1-555-000-0002',
    role: 'staff',
    specialization: 'Curl Type 3A–3C, DevaCut, Colour',
    bio: 'Zara has 8 years of experience specialising in wavy and curly hair. She is a certified DevaCut stylist and colour artist.',
    isActive: true,
  },
  {
    name: 'Marcus Rivera',
    email: 'marcus@BakeUrCurl.com',
    password: 'Staff@123',
    phone: '+1-555-000-0003',
    role: 'staff',
    specialization: 'Curl Type 4A–4C, Loc Maintenance, Natural Treatments',
    bio: 'Marcus is a specialist in coily and kinky hair textures with a passion for protective styles and scalp health.',
    isActive: true,
  },
];

const servicesData = [
  {
    name: 'Curly Hair Dry Cut & Styling',
    description:
      'Signature bespoke dry haircut tailored curl-by-curl to your unique curl pattern and volume. Includes botanical curl wash, deep hydration, and diffuse styling.',
    price: 1499,
    duration: 75,
    category: 'Hair',
    image: '',
  },
  {
    name: 'Haircutting & Setting',
    description:
      'Precision haircut, clarifying wash, texture balancing, and professional styling/setting for all hair types and wave lengths.',
    price: 899,
    duration: 45,
    category: 'Hair',
    image: '',
  },
  {
    name: 'Hair Coloring & Grey Coverage',
    description:
      'Premium ammonia-free root touch-up, full global color, and dimensional grey blending formulated to protect curl elasticity and shine.',
    price: 2199,
    duration: 90,
    category: 'Coloring',
    image: '',
  },
  {
    name: 'Hair & Scalp Treatments',
    description:
      'Deep restorative protein-moisture treatment, anti-dandruff detox, and warm botanical oil scalp massage to rejuvenate damaged curls.',
    price: 1899,
    duration: 60,
    category: 'Treatments',
    image: '',
  },
  {
    name: 'Skincare Facials & Cleanups',
    description:
      'Radiance-boosting facial treatment, steam pore extraction, gentle exfoliation, and custom herbal mask for refreshed, glowing skin.',
    price: 1299,
    duration: 60,
    category: 'Skincare',
    image: '',
  },
  {
    name: 'Wax Hair Removal',
    description:
      'Hygienic and gentle peel-off / strip wax hair removal using skin-soothing botanical formulations suitable for delicate skin.',
    price: 499,
    duration: 30,
    category: 'Waxing',
    image: '',
  },
  {
    name: 'Brow Threading',
    description:
      'High-precision organic brow shaping, arch definition, and upper lip threading for neat, flattering facial symmetry.',
    price: 149,
    duration: 15,
    category: 'Threading',
    image: '',
  },
  {
    name: 'Makeup & Bridal Artistry',
    description:
      'Professional HD party makeup, bridal hair setting, saree draping, and contemporary makeover artistry tailored for your big celebrations.',
    price: 4999,
    duration: 120,
    category: 'Bridal & Makeup',
    image: '',
  },
];

const productsData = [
  {
    name: 'BakeUrCurl Hydration Shampoo',
    description:
      'Sulfate-free, co-wash friendly shampoo enriched with aloe vera and glycerin. Gently cleanses without stripping natural oils. For all curl types.',
    price: 649,
    category: 'shampoo',
    brand: 'BakeUrCurl Essentials',
    stock: 50,
    images: [],
  },
  {
    name: 'Moisture Melt Deep Conditioner',
    description:
      'Weekly deep conditioning mask with shea butter, avocado oil, and hydrolysed silk proteins. Restores moisture balance and enhances curl definition. 8 oz.',
    price: 899,
    category: 'conditioner',
    brand: 'BakeUrCurl Essentials',
    stock: 35,
    images: [],
  },
  {
    name: 'Curl Custard Defining Cream',
    description:
      'A lightweight curl custard that provides hold without crunch. Flaxseed extract and castor oil nourish curls while reducing frizz. Suitable for Type 2C–4C.',
    price: 749,
    category: 'styling',
    brand: 'BakeUrCurl Essentials',
    stock: 40,
    images: [],
  },
  {
    name: 'Scalp Revival Oil Blend',
    description:
      'A nutrient-rich scalp oil blend of jamaican black castor oil, tea tree, and peppermint. Promotes growth, soothes itchiness, and combats dryness. 2 oz dropper bottle.',
    price: 19.99,
    category: 'treatment',
    brand: 'RootCare by BakeUrCurl',
    stock: 30,
    images: [],
  },
  {
    name: 'Wide-Tooth Seamless Detangling Comb',
    description:
      'Professional-grade seamless wide-tooth comb designed to detangle wet or dry curls without snapping. Made from anti-static, heat-resistant resin.',
    price: 12.5,
    category: 'tools',
    brand: 'ProCurl Tools',
    stock: 60,
    images: [],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  const isFresh = process.argv.includes('--fresh');

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    if (isFresh) {
      console.log('🗑️  Clearing existing data (--fresh flag detected)…');
      await Promise.all([
        User.deleteMany({}),
        Service.deleteMany({}),
        Product.deleteMany({}),
      ]);
      console.log('   Collections cleared.\n');
    }

    // ── Seed Users ──────────────────────────────────────────────────────────
    console.log('👥 Seeding users…');
    let adminUser = null;

    for (const userData of usersData) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`   ⚠️  User already exists: ${userData.email} (skipping)`);
        if (userData.role === 'admin') adminUser = existing;
        continue;
      }

      // Hash password manually because we're using insertMany-style create
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = await User.create({ ...userData, password: hashedPassword });
      console.log(`   ✅ Created ${user.role}: ${user.name} <${user.email}>`);
      if (user.role === 'admin') adminUser = user;
    }

    // Ensure we have an admin reference for createdBy fields
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }

    // ── Seed Services ───────────────────────────────────────────────────────
    console.log('\n💇 Seeding services…');
    for (const svcData of servicesData) {
      const existing = await Service.findOne({ name: svcData.name });
      if (existing) {
        console.log(`   ⚠️  Service already exists: "${svcData.name}" (skipping)`);
        continue;
      }
      const svc = await Service.create({ ...svcData, createdBy: adminUser?._id });
      console.log(`   ✅ Created service: ${svc.name} ($${svc.price} / ${svc.duration}min)`);
    }

    // ── Seed Products ───────────────────────────────────────────────────────
    console.log('\n🧴 Seeding products…');
    for (const prodData of productsData) {
      const existing = await Product.findOne({ name: prodData.name });
      if (existing) {
        console.log(`   ⚠️  Product already exists: "${prodData.name}" (skipping)`);
        continue;
      }
      const prod = await Product.create({ ...prodData, createdBy: adminUser?._id });
      console.log(`   ✅ Created product: ${prod.name} ($${prod.price})`);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log('🌀 BakeUrCurl seed complete!');
    console.log('─────────────────────────────────────────');
    console.log('Admin login:  admin@BakeUrCurl.com / Admin@123');
    console.log('Staff login:  zara@BakeUrCurl.com  / Staff@123');
    console.log('             marcus@BakeUrCurl.com / Staff@123');
    console.log('─────────────────────────────────────────\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
