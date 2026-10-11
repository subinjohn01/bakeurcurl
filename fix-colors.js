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
      
      // Replace any remaining purple/blue gradients with wood tones
      const replacements = {
        'rgba(91,33,182': 'rgba(74,47,30', // dark wood
        'rgba(20,12,40': 'rgba(40,26,18', // very dark wood
        '#6366F1': '#8B5A2B', // replacing indigo with saddle brown
        '#A78BFA': '#DEB887', // light wood (burlywood)
        '#7C3AED': '#A0522D', // sienna
        '#5B21B6': '#5C3A21', // dark brown
        '#0F0A1E': '#2A1810', // espresso
        '#1a0a2e': '#3E2723', // dark brown
        '#140a24': '#362117'  // dark wood
      };

      for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (c.includes(oldVal)) {
          c = c.split(oldVal).join(newVal);
          changed = true;
        }
      }

      // Also let's find any other rgb/rgba that might be purple
      if (changed) {
          console.log('Updated colors in', p);
          fs.writeFileSync(p, c);
      }
    }
  });
}
walk(dir);
