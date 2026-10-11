const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.html')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // 1. Convert all bullets back to 'A'
      c = c.replace(/•/g, 'A');
      
      // 2. Restore optional chaining (e.g., error.responseA.data -> error.response?.data)
      c = c.replace(/([a-zA-Z0-9_\]\)])A\./g, '.');
      
      // 3. Restore ternary operators (e.g., value A true : false -> value ? true : false)
      c = c.replace(/ A /g, ' ? ');
      
      // 4. Restore specific question marks in text that became 'A'
      c = c.replace(/CurlsA/g, 'Curls?');
      c = c.replace(/BakeUrCurlA/g, 'BakeUrCurl?');
      c = c.replace(/delete thisA/g, 'delete this?');
      c = c.replace(/remove thisA/g, 'remove this?');
      c = c.replace(/Remove thisA/g, 'Remove this?');
      
      // 5. Fix any 'A' that might have been part of an emoji fix previously
      // earlier I replaced 'dYO?' with sparkle, but it might be 'dYOA' now
      c = c.replace(/dYOA/g, '✨');
      c = c.replace(/dY"\./g, '📅');
      c = c.replace(/dY A/g, '🕒');
      
      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
