const fs = require('fs');

// 1. Fix BookingPage.js
const bookingPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/BookingPage.js';
let bookingCode = fs.readFileSync(bookingPath, 'utf8');

bookingCode = bookingCode.replace(
  'getServices().then(r => setServices(r.dat.services || r.data || [])).catch(() => setServices(mockServices));',
  'getServices().then(r => setServices(r.data?.services || r.data || [])).catch(() => setServices(mockServices));'
);

bookingCode = bookingCode.replace(
  /if \(location\.stat\.serviceId\) \{[\s\S]*?if \(svc\) setSelectedService\(svc\);[\s\S]*?\}/m,
  `const targetServiceId = location.state?.selectedServiceId || location.state?.serviceId;
    if (targetServiceId && services.length) {
      const svc = services.find(s => s._id === targetServiceId);
      if (svc) setSelectedService(svc);
    }`
);

bookingCode = bookingCode.replace('res.dat._id', 'res.data?._id');

fs.writeFileSync(bookingPath, bookingCode, 'utf8');
console.log('Fixed BookingPage.js');

// 2. Fix LoginPage.js
const loginPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/LoginPage.js';
let loginCode = fs.readFileSync(loginPath, 'utf8');
loginCode = loginCode.replace('location.stat.fro.pathname', 'location.state?.from?.pathname');
fs.writeFileSync(loginPath, loginCode, 'utf8');
console.log('Fixed LoginPage.js');

// 3. Fix ProductsPage.js
const productsPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ProductsPage.js';
let productsCode = fs.readFileSync(productsPath, 'utf8');
productsCode = productsCode.replace('res.dat.products', 'res.data?.products');
fs.writeFileSync(productsPath, productsCode, 'utf8');
console.log('Fixed ProductsPage.js');
