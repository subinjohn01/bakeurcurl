const fs = require('fs');
const testSuitePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/test-suite.js';
let testCode = fs.readFileSync(testSuitePath, 'utf8');

// Add comprehensive static analysis checks for truncated identifiers
const newChecks = `
  // Check for any potential property truncation patterns (e.g. .stat., .dat., .fro., selectedServic)
  const suspiciousTruncations = ['.stat.', '.dat.', '.fro.', 'selectedServic', 'use.role', 'use.name', 'customerInf.'];
  let foundSuspicious = [];
  for (const file of jsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    for (const pat of suspiciousTruncations) {
      if (code.includes(pat)) {
        foundSuspicious.push(\`\${path.basename(file)} contains '\${pat}'\`);
      }
    }
  }
  assert(foundSuspicious.length === 0, 'Zero suspicious property truncations (.stat, .dat, .fro, selectedServic)', foundSuspicious.join(', '));
`;

testCode = testCode.replace(
  "assert(!truncatedTypoFound, 'Zero truncated variable typos found (selectedService, user, customerInfo verified)');",
  "assert(!truncatedTypoFound, 'Zero truncated variable typos found (selectedService, user, customerInfo verified)');\n" + newChecks
);

fs.writeFileSync(testSuitePath, testCode, 'utf8');
console.log('Updated test-suite.js with deeper property inspection!');
