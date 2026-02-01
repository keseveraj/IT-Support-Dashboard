const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Dashboard.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original file size:', content.length, 'bytes');

// Fix spacing in Tailwind classes
content = content.replace(/p - 2/g, 'p-2');
content = content.replace(/rounded - lg/g, 'rounded-lg');
content = content.replace(/text - xl/g, 'text-xl');
content = content.replace(/font - bold/g, 'font-bold');
content = content.replace(/w - 6/g, 'w-6');

// Fix template literal spacing - remove spaces after ${ and before }
content = content.replace(/\$\{\s+/g, '${');
content = content.replace(/\s+\}/g, '}');

console.log('Fixed file size:', content.length, 'bytes');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File saved successfully!');

// Verify the fix
const verify = fs.readFileSync(filePath, 'utf8');
const hasSpaces = verify.includes('p - 2') || verify.includes('${ ');
console.log('Verification:', hasSpaces ? '✗ FAILED - spaces still present' : '✓ SUCCESS - all spaces removed');
