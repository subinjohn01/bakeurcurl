const fs = require('fs');

function fix(file, replaces) {
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;
  replaces.forEach(([oldStr, newStr]) => {
    if (c.includes(oldStr)) {
      c = c.replace(oldStr, newStr);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(file, c);
    console.log('Fixed syntax in', file);
  }
}

const pf = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/booking/PaymentForm.js';
fix(pf, [
  ['onSucces.(', 'onSuccess('],
  ['err.respons.dat.message', 'err.response?.data?.message']
]);

const nv = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/layout/Navbar.js';
fix(nv, [
  ['use.nam.charAt(0.toUpperCase()', 'user?.name?.charAt(0).toUpperCase()'],
  ['use.nam.split', 'user?.name?.split']
]);

const cp = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ContactPage.js';
fix(cp, [
  ['placeholder=\"What\\'s this about,1 value=', 'placeholder=\"What\\'s this about?\" value='],
  ['Send Message dY\\'o', 'Send Message ✉️']
]);

const pp = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ProductsPage.js';
fix(pp, [
  ['product.image.[0]', 'product.images?.[0]'],
  [\"'dY ''\", \"'📦'\"]
]);

const ab = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/admin/AdminBookings.js';
fix(ab, [
  ['{.replace(', '{s.replace('],
  ['background: ,1{c}20', 'background: ${c}20'],
  [',1{', '${']
]);

const ap = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/admin/AdminProducts.js';
fix(ap, [
  ['p.image.[0]', 'p.images?.[0]'],
  [\"'dY ''\", \"'📦'\"],
  [',1{p.price}', '₹{p.price}'],
  [',1{p.stock} in stock,1{p.stock < 5 ? \\' ?" Low!\\' : \\'\\'}', '${p.stock} in stock'],
  ['A', '•']
]);

