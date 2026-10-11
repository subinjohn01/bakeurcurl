const fs = require('fs');
const path = require('path');
const frontendSrc = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (f.endsWith('.js')) {
      let code = fs.readFileSync(full, 'utf8');
      let changed = false;

      if (code.includes('react▾dom')) {
        code = code.replace(/react▾dom/g, 'react-dom');
        changed = true;
      }
      if (code.includes('▾')) {
        code = code.replace(/▾/g, '-');
        changed = true;
      }
      if (code.includes('•')) {
        // In JS syntax, if it's optional chaining or ternary or query string
        // Check where • was inserted:
        // restore optional chaining like user•.
        code = code.replace(/([a-zA-Z0-9_$\]\)])•\./g, '$1?.');
        // restore ternary like • :
        code = code.replace(/ • /g, ' ? ');
        code = code.replace(/\(•\)/g, '(?)');
        code = code.replace(/•/g, '?');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, code, 'utf8');
        console.log('Fixed syntax in:', f);
      }
    }
  }
}

walk(frontendSrc);
