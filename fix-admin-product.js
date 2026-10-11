const fs = require('fs');
let c = fs.readFileSync('C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/admin/AdminProducts.js', 'utf8');
c = c.replace('placeholder=\"What does it do? />', 'placeholder=\"What does it do?\" />');
fs.writeFileSync('C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/admin/AdminProducts.js', c);
