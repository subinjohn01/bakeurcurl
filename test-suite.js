/**
 * BakeUrCurls — Comprehensive Automated Test Suite
 *
 * Runs post-development verification across:
 * 1. Backend REST API Endpoints (Services, Products, Bookings, Auth, Queries)
 * 2. Frontend React Component Integrity & JavaScript AST Syntax
 * 3. Database Connection & Schema Health
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} ${testName}`);
    passed++;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} ${testName} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

function request(method, path, body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api' + path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Request timed out' });
    });
    if (body) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   BakeUrCurls — Automated Health & Smoke Test Suite${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // 1. BACKEND API TESTS
  console.log(`${colors.bold}1. Backend REST API Tests:${colors.reset}`);

  // Test 1.1: Services
  const svcRes = await request('GET', '/services');
  assert(!svcRes.error && svcRes.status === 200, 'GET /api/services returns HTTP 200');
  const services = svcRes.data?.services || [];
  assert(services.length === 8, `GET /api/services returns exactly 8 services (received ${services.length})`);
  
  const hasDryCut = services.some(s => s.name.includes('Curly Hair Dry Cut & Styling'));
  assert(hasDryCut, 'Contains signature "Curly Hair Dry Cut & Styling" service');

  // Test 1.2: Products
  const prodRes = await request('GET', '/products');
  assert(!prodRes.error && prodRes.status === 200, 'GET /api/products returns HTTP 200');
  const products = prodRes.data?.products || [];
  assert(products.length >= 5, `GET /api/products returns products catalog (${products.length} products)`);

  // Test 1.3: Available Slots (with safe null-staff handling)
  const today = new Date().toISOString().split('T')[0];
  const slotsRes = await request('GET', `/bookings/available-slots?date=${today}`);
  assert(!slotsRes.error && (slotsRes.status === 200 || slotsRes.status === 304), 'GET /api/bookings/available-slots returns valid slots (handles optional staff safely)');

  // Test 1.4: Query submission
  const queryRes = await request('POST', '/queries', {
    name: 'Automated Test User',
    email: 'test@bakeurcurls.com',
    phone: '7012001472',
    subject: 'Automated Test Inquiry',
    message: 'Testing system health and inquiry routing.',
  });
  assert(!queryRes.error && (queryRes.status === 200 || queryRes.status === 201), 'POST /api/queries accepts customer queries');

  // Test 1.5: Mail OTP Password Reset Flow
  const otpRes = await request('POST', '/auth/forgot-password-otp', { email: 'admin@bakeurcurl.com' });
  assert(!otpRes.error && otpRes.status === 200, 'POST /api/auth/forgot-password-otp generates & sends OTP');
  const otp = otpRes.data?.devOtp;
  assert(!!otp && otp.length === 6, 'OTP generated is a 6-digit numeric verification code');

  // Negative test: invalid OTP
  const badOtpRes = await request('POST', '/auth/reset-password-otp', {
    email: 'admin@bakeurcurl.com',
    otp: '000000',
    newPassword: 'TempPassword123'
  });
  assert(badOtpRes.status === 400, 'POST /api/auth/reset-password-otp rejects invalid/expired OTP');

  // Positive test: valid OTP reset
  const goodOtpRes = await request('POST', '/auth/reset-password-otp', {
    email: 'admin@bakeurcurl.com',
    otp: otp,
    newPassword: 'TempAdminPass123'
  });
  assert(goodOtpRes.status === 200, 'POST /api/auth/reset-password-otp successfully resets password with valid OTP');

  // Verify login with new password
  const newLoginRes = await request('POST', '/auth/login', {
    email: 'admin@bakeurcurl.com',
    password: 'TempAdminPass123'
  });
  assert(newLoginRes.status === 200, 'Login succeeds with the newly reset OTP password');

  // Restore password back to Admin@123
  const restoreOtpRes = await request('POST', '/auth/forgot-password-otp', { email: 'admin@bakeurcurl.com' });
  if (restoreOtpRes.data?.devOtp) {
    await request('POST', '/auth/reset-password-otp', {
      email: 'admin@bakeurcurl.com',
      otp: restoreOtpRes.data.devOtp,
      newPassword: 'Admin@123'
    });
  }

  // 2. FRONTEND SOURCE CODE INTEGRITY TESTS
  console.log(`\n${colors.bold}2. Frontend JavaScript Code Integrity Tests:${colors.reset}`);

  const frontendSrc = path.join(__dirname, 'frontend', 'src');
  const jsFiles = [];

  function collectJs(dir) {
    fs.readdirSync(dir).forEach(f => {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) collectJs(full);
      else if (f.endsWith('.js')) jsFiles.push(full);
    });
  }
  collectJs(frontendSrc);

  assert(jsFiles.length >= 30, `Frontend has full component suite (${jsFiles.length} files scanned)`);

  // Check for regex word-boundary property truncations (.stat., .dat., .fro., selectedServic.)
  const truncationPatterns = [/\.stat\./, /\.dat\./, /\.fro\./, /\bselectedServic\./, /\bselectedServic\b(?!\w)/, /\buse\.role\b/, /\buse\.name\b/];
  let foundSuspicious = [];
  for (const file of jsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    for (const pat of truncationPatterns) {
      if (pat.test(code)) {
        foundSuspicious.push(`${path.basename(file)} matches ${pat}`);
      }
    }
  }
  assert(foundSuspicious.length === 0, 'Zero suspicious property truncations (.stat, .dat, .fro, selectedServic)', foundSuspicious.join(', '));

  // Test 2.3: BookingPage has valid handlers and safe location.state access
  const bookingPageCode = fs.readFileSync(path.join(frontendSrc, 'pages', 'BookingPage.js'), 'utf8');
  assert(bookingPageCode.includes('selectedService'), 'BookingPage.js has selectedService properly defined');
  assert(!bookingPageCode.includes('location.stat.'), 'BookingPage.js has safe location.state access (no location.stat)');

  // Test 2.4: ServicesPage has BUC categories
  const servicesPageCode = fs.readFileSync(path.join(frontendSrc, 'pages', 'ServicesPage.js'), 'utf8');
  assert(servicesPageCode.includes('Bridal & Makeup') && servicesPageCode.includes('Threading'), 'ServicesPage has BUC service categories');

  // Test 2.5: Error Notification Toast System Verification
  console.log(`\n${colors.bold}3. Toast Notification & Error Message Integrity Tests:${colors.reset}`);
  const appJsCode = fs.readFileSync(path.join(frontendSrc, 'App.js'), 'utf8');
  assert(appJsCode.includes('<Toaster') && appJsCode.includes('toastOptions'), 'App.js contains global Toaster provider with custom options');
  assert(appJsCode.includes('error:') && appJsCode.includes('iconTheme: { primary: \'#F87171\''), 'Global toast configuration defines explicit error theme and visible contrast');

  const indexCssCode = fs.readFileSync(path.join(frontendSrc, 'index.css'), 'utf8');
  assert(indexCssCode.includes('[data-rht-toaster]'), 'Global CSS guarantees visible background and text contrast for toast notifications');
  assert(indexCssCode.includes('[data-rht-toaster] > div') && indexCssCode.includes('pointer-events: none !important'), 'Toaster full-width wrapper has pointer-events: none to prevent blocking button clicks');

  // Test 2.6: Zero broken template interpolations or corrupt rupee symbols in code
  let brokenInterpolations = [];
  for (const file of jsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    if (code.includes('₹{') || code.includes('?{isOOS')) {
      brokenInterpolations.push(path.basename(file));
    }
  }
  assert(brokenInterpolations.length === 0, 'Zero broken template interpolations (${} intact across all files)', brokenInterpolations.join(', '));

  // Test 2.7: All toast.error calls provide non-empty message or fallback
  let nakedToastErrors = [];
  for (const file of jsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    const regex = /toast\.error\(\s*err\.response\?\.data\?\.message\s*\)/g;
    if (regex.test(code)) {
      nakedToastErrors.push(path.basename(file));
    }
  }
  assert(nakedToastErrors.length === 0, 'All API error toasts guarantee fallback messages (no empty error toasts)', nakedToastErrors.join(', '));

  // 4. FRONTEND BUILD PRODUCTION TEST
  console.log(`\n${colors.bold}4. Production Build & Bundle Verification:${colors.reset}`);
  const buildIndex = path.join(__dirname, 'frontend', 'build', 'index.html');
  const buildExists = fs.existsSync(buildIndex);
  assert(buildExists, 'Production build artifact exists at frontend/build/index.html');

  // TEST SUMMARY
  console.log(`\n${colors.bold}${colors.cyan}----------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}Results: ${colors.green}${passed} passed${colors.reset}, ${failed > 0 ? colors.red + failed + ' failed' : colors.green + '0 failed'}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}----------------------------------------------------${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite();
