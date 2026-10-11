const fs = require('fs');
const homePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/HomePage.js';
let content = fs.readFileSync(homePath, 'utf8');

content = content.replace(
  /dYO\?[^<]*Premium Curly Hair Salon/g,
  '✨ Premium Curly Hair Salon'
);

content = content.replace(
  "color: '#fff',",
  "color: '#F1D592',"
);

fs.writeFileSync(homePath, content, 'utf8');
console.log('Fixed HomePage badge and h1 color');
