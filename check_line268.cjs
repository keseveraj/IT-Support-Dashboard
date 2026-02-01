const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Dashboard.tsx');

console.log('=== Checking Line 268 ===');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Get line 268 (index 267)
const line268 = lines[267];
console.log('Line 268:', JSON.stringify(line268));
console.log('Length:', line268.length);

// Find the className part
const classNameMatch = line268.match(/className=\{`[^`]*`\}/);
if (classNameMatch) {
    console.log('className found:', classNameMatch[0]);
} else {
    console.log('className NOT found - checking for malformed syntax');
    const partialMatch = line268.match(/className=\{[^}]*\}/);
    if (partialMatch) {
        console.log('Partial match:', partialMatch[0]);
    }
}

// Check for the exact position around column 35
console.log('\nCharacters around position 35:');
for (let i = 30; i < 45 && i < line268.length; i++) {
    const char = line268[i];
    const code = char.charCodeAt(0);
    console.log(`  [${i}]: '${char}' (${code})`);
}
