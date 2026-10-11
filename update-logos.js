const fs = require('fs');

// 1. Update Navbar.js
const navbarPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/layout/Navbar.js';
let navbarCode = fs.readFileSync(navbarPath, 'utf8');

// Replace CurlIcon with an image component
const newLogoComponent = `const CurlIcon = () => (
  <img
    src="/buc-logo.png"
    alt="BakeUrCurls Logo"
    style={{
      width: 42,
      height: 42,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1.5px solid #D4AF37',
      boxShadow: '0 0 12px rgba(212, 175, 55, 0.45)',
      display: 'block',
    }}
  />
);`;

navbarCode = navbarCode.replace(/const CurlIcon = \(\) => \([\s\S]*?\n\);/m, newLogoComponent);
// Make the Brand Text in Navbar pure champagne gold
navbarCode = navbarCode.replace(
  "background: 'linear-gradient(135deg, #fff 40%, #E8B4A0)',",
  "background: 'linear-gradient(135deg, #F1D592 30%, #D4AF37)',"
);
fs.writeFileSync(navbarPath, navbarCode, 'utf8');
console.log('Updated Navbar.js with Gold Medallion Logo');

// 2. Update HomePage.js badge (remove blue swirl emoji)
const homePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/HomePage.js';
let homeCode = fs.readFileSync(homePath, 'utf8');
homeCode = homeCode.replace(/>\s*dYO\?.*Premium Curly Hair Salon/g, '>✨ Premium Curly Hair Salon');
homeCode = homeCode.replace(/>\s*✨.*Premium Curly Hair Salon/g, '>✨ Premium Curly Hair Salon');
fs.writeFileSync(homePath, homeCode, 'utf8');
console.log('Updated HomePage.js badge');

// 3. Update Footer.js brand logo
const footerPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/layout/Footer.js';
let footerCode = fs.readFileSync(footerPath, 'utf8');
const oldFooterIconRegex = /<div\s+style=\{\{\s*width:\s*36,\s*height:\s*36,[\s\S]*?<\/div>/;
const newFooterLogo = `<img
                src="/buc-logo.png"
                alt="BakeUrCurls Logo"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #D4AF37',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              />`;
footerCode = footerCode.replace(oldFooterIconRegex, newFooterLogo);
fs.writeFileSync(footerPath, footerCode, 'utf8');
console.log('Updated Footer.js logo');

// 4. Update Sidebar.js (Admin sidebar)
const sidebarPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/admin/Sidebar.js';
if (fs.existsSync(sidebarPath)) {
  let sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
  sidebarCode = sidebarCode.replace(/<div style=\{\{ width: 36, height: 36[\s\S]*?<\/div>/, `<img src="/buc-logo.png" alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #D4AF37' }} />`);
  fs.writeFileSync(sidebarPath, sidebarCode, 'utf8');
  console.log('Updated Sidebar.js logo');
}
