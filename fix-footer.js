const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(directory) {
  fs.readdirSync(directory).forEach(f => {
    let p = path.join(directory, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.js') || p.endsWith('.css')) {
      let c = fs.readFileSync(p, 'utf8');
      let changed = false;
      
      const replacements = {
        'rgba(15,10,30': 'rgba(35,24,18',   // #231812 rgb equivalent
        'rgba(26,10,46': 'rgba(46,30,20',   // #2E1E14 rgb equivalent
        '#1a0a2e': '#2E1E14',
        '#0F0A1E': '#231812',
        '#7C3AED': '#A87A51',
        'rgba(124,58,237': 'rgba(168,122,81'
      };

      for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (c.includes(oldVal)) {
          c = c.split(oldVal).join(newVal);
          changed = true;
        }
      }

      if (changed) {
          console.log('Fixed RGB in', p);
          fs.writeFileSync(p, c);
      }
    }
  });
}
walk(dir);
