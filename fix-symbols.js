const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      
      c = c.replace(/,1/g, '');
      c = c.replace(/\?"/g, '-');
      c = c.replace(/\?/g, '•');
      c = c.replace(/A/g, '•');
      c = c.replace(/dYO\?/g, '✨');
      c = c.replace(/dY"\./g, '📅');
      c = c.replace(/dY \?/g, '🕒');
      c = c.replace(/dY'\+/g, '💇‍♀️');

      fs.writeFileSync(p, c);
    }
  });
}
walk(dir);
