const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.html')) {
      let c = fs.readFileSync(p, 'utf8');
      
      c = c.replace(/err\.respons\.dat\.message/g, 'err.response?.data?.message');
      c = c.replace(/error\.respons\.status/g, 'error.response?.status');
      c = c.replace(/customerInf\./g, 'customerInfo?.');
      c = c.replace(/stylis\./g, 'stylist?.');
      c = c.replace(/b\.staf\./g, 'b.staff?.');
      c = c.replace(/b\.guestInf\./g, 'b.guestInfo?.');
      c = c.replace(/b\.custome\./g, 'b.customer?.');
      
      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
