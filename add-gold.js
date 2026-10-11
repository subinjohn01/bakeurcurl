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
        '#C4B5FD': '#E5C07B', // Gold color for premium feel
        'dYO?': '✨',         // Fix corrupted swirl emoji with sparkle
        'dY".': '📅',         // Fix calendar emoji
        'dY ?': '🕒',         // Fix clock emoji
        'dY\'+': '💇‍♀️',      // Fix stylist emoji
        'A': '•',            // Fix bullet dot
        '?"': '₹',           // Fix another variation of broken Rupee
        ',1': '₹',
        '#A87A51': '#D4AF37', // Make the primary light brown more Golden
        '#E8B4A0': '#F1D592'  // Make the rose-gold more Golden/Champagne
      };

      for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (c.includes(oldVal)) {
          c = c.split(oldVal).join(newVal);
          changed = true;
        }
      }

      if (changed) {
          console.log('Added gold accents in', p);
          fs.writeFileSync(p, c);
      }
    }
  });
}
walk(dir);
