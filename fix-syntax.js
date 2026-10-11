const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js') || p.endsWith('.css')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Restore optional chaining: varA.prop -> var?.prop
      c = c.replace(/([a-zA-Z0-9_\]\)])A\./g, '.');
      
      // Restore ternary operators: var A true : false -> var ? true : false
      c = c.replace(/ A /g, ' ? ');

      // Restore specific broken strings
      c = c.replace(/error\.responseA\.data/g, 'error.response?.data');
      c = c.replace(/error\.responseA\.status/g, 'error.response?.status');
      
      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
