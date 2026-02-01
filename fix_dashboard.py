#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix Dashboard.tsx syntax errors"""

import re

# Read the file
with open('pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix spacing in Tailwind classes
content = content.replace('p - 2', 'p-2')
content = content.replace('rounded - lg', 'rounded-lg')
content = content.replace('text - xl', 'text-xl')
content = content.replace('font - bold', 'font-bold')
content = content.replace('w - 6', 'w-6')

# Fix template literal spacing
content = re.sub(r'\$\{\s+', '${', content)
content = re.sub(r'\s+\}', '}', content)

# Write back
with open('pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Dashboard.tsx successfully!")
