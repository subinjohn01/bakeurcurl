const fs = require('fs');
const seedPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/backend/seed/seedData.js';
let content = fs.readFileSync(seedPath, 'utf8');

// Replace servicesData
const newServicesCode = `const servicesData = [
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
];`;

content = content.replace(/const servicesData = \[\s*\{[\s\S]*?\}\s*\];/m, newServicesCode);

// Update product prices to INR
content = content.replace(/price: 22\.99/g, 'price: 649');
content = content.replace(/price: 28\.5/g, 'price: 899');
content = content.replace(/price: 24\.99/g, 'price: 749');
content = content.replace(/price: 18\.0/g, 'price: 549');
content = content.replace(/price: 16\.5/g, 'price: 499');

fs.writeFileSync(seedPath, content, 'utf8');
console.log('Updated seedData.js with 8 BUC services!');
