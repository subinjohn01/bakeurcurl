const fs = require('fs');
const path = require('path');
const frontendSrc = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';

// 1. Update index.css
const cssPath = path.join(frontendSrc, 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace('color: #ffffff;', 'color: #FBF6EE;');
  css = css.replace('color: white !important;', 'color: #F1D592 !important;');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Updated index.css');
}

// 2. Walk and update JS components
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (f.endsWith('.js')) {
      let code = fs.readFileSync(full, 'utf8');
      let changed = false;

      // Fix stray corrupted characters if any
      const cleaned = code
        .replace(/rgba\(168[^\d,]*,\s*122/g, 'rgba(168,122')
        .replace(/rgba\(232[^\d,]*,\s*180[^\d,]*,\s*160/g, 'rgba(232,180,160')
        .replace(/BakeUrCurlA/g, 'BakeUrCurl?')
        .replace(/\?/g, '•')
        .replace(/\?"/g, '—')
        .replace(/\s*-\s*/g, '▾');
      
      if (cleaned !== code) {
        code = cleaned;
        changed = true;
      }

      // Upgrade headings to Champagne Gold (#F1D592)
      // Matching color: '#fff' inside h1, h2, h3 tags or hero titles
      const headingReplacements = [
        ["color: '#fff', marginBottom: 16", "color: '#F1D592', marginBottom: 16"],
        ["color: '#fff', marginBottom: 12", "color: '#F1D592', marginBottom: 12"],
        ["color: '#fff', marginBottom: 24", "color: '#F1D592', marginBottom: 24"],
        ["color: '#fff', marginBottom: 20", "color: '#F1D592', marginBottom: 20"],
        ["fontFamily: \"'Playfair Display', serif\",\n                  fontSize: 'clamp(40px, 6vw, 72px)',\n                  fontWeight: 700,\n                  lineHeight: 1.1,\n                  marginBottom: 24,\n                  color: '#fff'", "fontFamily: \"'Playfair Display', serif\",\n                  fontSize: 'clamp(40px, 6vw, 72px)',\n                  fontWeight: 700,\n                  lineHeight: 1.1,\n                  marginBottom: 24,\n                  color: '#F1D592'"],
      ];

      for (const [target, repl] of headingReplacements) {
        if (code.includes(target)) {
          code = code.replace(target, repl);
          changed = true;
        }
      }

      // Replace pure stark white with warm cream (#FBF6EE) for general text & cards
      // and replace stark rgba(255,255,255 with warm ivory rgba(251,246,238
      const textReplacements = [
        ["color: '#ffffff'", "color: '#FBF6EE'"],
        ["color: 'white'", "color: '#FBF6EE'"],
        ["rgba(255,255,255,", "rgba(251,246,238,"],
        ["rgba(255, 255, 255,", "rgba(251,246,238,"]
      ];

      for (const [target, repl] of textReplacements) {
        if (code.includes(target)) {
          code = code.split(target).join(repl);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(full, code, 'utf8');
        console.log('Updated font colors in:', f);
      }
    }
  }
}

walk(frontendSrc);
