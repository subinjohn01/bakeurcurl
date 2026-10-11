const fs = require('fs');

// 1. Update ServicesPage.js
const servicesPagePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ServicesPage.js';
let servicesCode = fs.readFileSync(servicesPagePath, 'utf8');

servicesCode = servicesCode.replace(
  /const load = async \(\) => \{[\s\S]*?finally \{[\s\S]*?setLoading\(false\);[\s\S]*?\}[\s\S]*?\};/m,
  `const load = async () => {
      try {
        const res = await getServices();
        const list = Array.isArray(res.data?.services) 
          ? res.data.services 
          : (Array.isArray(res.data) ? res.data : mockServices);
        setServices(list.length > 0 ? list : mockServices);
      } catch {
        setServices(mockServices);
      } finally {
        setLoading(false);
      }
    };`
);
fs.writeFileSync(servicesPagePath, servicesCode, 'utf8');
console.log('Fixed ServicesPage.js array handling');

// 2. Update BookingPage.js
const bookingPagePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/BookingPage.js';
let bookingCode = fs.readFileSync(bookingPagePath, 'utf8');

// Replace mockServices with the 8 real BUC services
const newMockServices = `const mockServices = [
  { _id: '1', name: 'Curly Hair Dry Cut & Styling', category: 'Hair', price: 1499, duration: 75, emoji: '✂️' },
  { _id: '2', name: 'Haircutting & Setting', category: 'Hair', price: 899, duration: 45, emoji: '💇‍♀️' },
  { _id: '3', name: 'Hair Coloring & Grey Coverage', category: 'Coloring', price: 2199, duration: 90, emoji: '🎨' },
  { _id: '4', name: 'Hair & Scalp Treatments', category: 'Treatments', price: 1899, duration: 60, emoji: '💆‍♀️' },
  { _id: '5', name: 'Skincare Facials & Cleanups', category: 'Skincare', price: 1299, duration: 60, emoji: '✨' },
  { _id: '6', name: 'Wax Hair Removal', category: 'Waxing', price: 499, duration: 30, emoji: '🍯' },
  { _id: '7', name: 'Brow Threading', category: 'Threading', price: 149, duration: 15, emoji: '🪡' },
  { _id: '8', name: 'Makeup & Bridal Artistry', category: 'Bridal & Makeup', price: 4999, duration: 120, emoji: '👑' },
];`;

bookingCode = bookingCode.replace(/const mockServices = \[\s*\{[\s\S]*?\}\s*\];/m, newMockServices);

// Ensure getServices result is validated as array
bookingCode = bookingCode.replace(
  /getServices\(\)\.then\([\s\S]*?\)\.catch\(\(\) => setServices\(mockServices\)\);/m,
  `getServices().then(r => {
      const list = Array.isArray(r.data?.services)
        ? r.data.services
        : (Array.isArray(r.data) ? r.data : mockServices);
      setServices(list.length > 0 ? list : mockServices);
    }).catch(() => setServices(mockServices));`
);

fs.writeFileSync(bookingPagePath, bookingCode, 'utf8');
console.log('Fixed BookingPage.js mockServices & array handling');

// 3. Update ProductsPage.js
const productsPagePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ProductsPage.js';
let productsCode = fs.readFileSync(productsPagePath, 'utf8');

productsCode = productsCode.replace(
  /const load = async \(\) => \{[\s\S]*?setProducts\([\s\S]*?\);[\s\S]*?\} catch \{[\s\S]*?setProducts\(mockProducts\);[\s\S]*?\} finally \{[\s\S]*?setLoading\(false\);[\s\S]*?\}[\s\S]*?\};/m,
  `const load = async () => {
      try {
        const res = await getProducts();
        const list = Array.isArray(res.data?.products)
          ? res.data.products
          : (Array.isArray(res.data) ? res.data : mockProducts);
        setProducts(list.length > 0 ? list : mockProducts);
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };`
);

fs.writeFileSync(productsPagePath, productsCode, 'utf8');
console.log('Fixed ProductsPage.js array handling');

