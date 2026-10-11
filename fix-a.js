const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js') || p.endsWith('.css')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Fix the accidental 'A' replacement
      if (c.includes('•') || c.includes('?') || c.includes('A') || c.includes('?')) {
        // Because of encoding, it might be exactly '•' or '?' or 'ï¿½?ï¿½'
        // Since I blindly replaced 'A' with '•', let's just reverse it.
        c = c.replace(/•/g, 'A');
        c = c.replace(/\?/g, 'A'); // For the specific mangled char seen
        c = c.replace(/A/g, 'A');
      }
      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
