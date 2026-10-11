const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Fix broken Bearer token
      c = c.replace(/Bearer ,1\{token\}/g, 'Bearer ${token}');
      c = c.replace(/Bearer ,1\{/g, 'Bearer ${');
      c = c.replace(/,1\{/g, '{'); // any other template literals that broke

      // Fix error.respons.status if present
      c = c.replace(/error\.respons\.status/g, 'error.response?.status');
      c = c.replace(/error\.respons\.\?/g, 'error.response?.');

      // Add gold sparkles to the text in HomePage directly
      if (p.includes('HomePage.js')) {
        c = c.replace('Premium Curly Hair Salon', '✨ Premium Curly Hair Salon');
      }

      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
