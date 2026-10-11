const fs = require('fs');
const path = require('path');
const dir = "C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src";

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      let changed = false;
      
      // Fix ?{ -> ₹{
      if (c.includes('?{')) {
          c = c.replace(/\?\{/g, '₹{');
          changed = true;
      }
      // Fix ?65 -> ₹65
      if (c.match(/\?[0-9]/)) {
        c = c.replace(/\?([0-9]+)/g, '₹$1');
        changed = true;
      }
      
      if (changed) {
          console.log("Fixed", p);
          fs.writeFileSync(p, c);
      }
    }
  });
}
walk(dir);
