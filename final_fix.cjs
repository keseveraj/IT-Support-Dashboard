const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Dashboard.tsx');

console.log('=== Final Dashboard Fix ===');
console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

const originalSize = content.length;
console.log('Original file size:', originalSize, 'bytes');

// Apply all fixes comprehensively
const fixes = [
    { pattern: /p - 2/g, replacement: 'p-2', name: 'p-2 spacing' },
    { pattern: /rounded - lg/g, replacement: 'rounded-lg', name: 'rounded-lg spacing' },
    { pattern: /text - xl/g, replacement: 'text-xl', name: 'text-xl spacing' },
    { pattern: /font - bold/g, replacement: 'font-bold', name: 'font-bold spacing' },
    { pattern: /w - 6/g, replacement: 'w-6', name: 'w-6 spacing' },
    { pattern: /\$\{\s+/g, replacement: '${', name: 'template literal opening' },
    { pattern: /\s+\}/g, replacement: '}', name: 'closing brace spacing' },
    { pattern: /\s+`>/g, replacement: '`>', name: 'trailing space before `>' },
    { pattern: /color}\s+`/g, replacement: 'color}`', name: 'space between } and `' }
];

let changesMade = 0;
fixes.forEach(fix => {
    const before = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (before !== content) {
        changesMade++;
        console.log(`✓ Fixed: ${fix.name}`);
    }
});

const finalSize = content.length;
console.log('\nFixed file size:', finalSize, 'bytes');
console.log('Bytes removed:', originalSize - finalSize);
console.log('Fixes applied:', changesMade);

// Write the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✓ File saved successfully!');

// Comprehensive verification
const verify = fs.readFileSync(filePath, 'utf8');
const issues = [];
if (verify.includes('p - 2')) issues.push('p - 2');
if (verify.includes('rounded - lg')) issues.push('rounded - lg');
if (verify.match(/\$\{\s+/)) issues.push('${ spacing');
if (verify.match(/\s+\}/)) issues.push(' } spacing');
if (verify.match(/color}\s+`/)) issues.push('color} ` spacing');

if (issues.length === 0) {
    console.log('\n✅ VERIFICATION PASSED - All syntax errors fixed!');
} else {
    console.log('\n❌ VERIFICATION FAILED - Issues remaining:', issues.join(', '));
}
