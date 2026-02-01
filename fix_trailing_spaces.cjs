const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Dashboard.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original file size:', content.length, 'bytes');

// Fix all trailing spaces before closing backticks and angle brackets
content = content.replace(/\s+`>/g, '`>');
content = content.replace(/\s+\}/g, '}');

console.log('Fixed file size:', content.length, 'bytes');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File saved successfully!');

// Verify the fix
const verify = fs.readFileSync(filePath, 'utf8');
const hasTrailingSpaces = verify.match(/\s+`>/);
console.log('Verification:', hasTrailingSpaces ? '✗ FAILED - trailing spaces still present' : '✓ SUCCESS - all trailing spaces removed');
