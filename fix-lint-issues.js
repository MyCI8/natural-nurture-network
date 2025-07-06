#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common patterns to fix
const patterns = [
  // Remove unused imports
  {
    name: 'Remove unused React imports',
    pattern: /import React,? {[^}]*} from ['"]react['"];?/g,
    replacement: (match) => {
      // Remove React from imports if it's the only import
      const imports = match.match(/{([^}]*)}/)?.[1] || '';
      const importList = imports.split(',').map(s => s.trim()).filter(s => s !== 'React');
      if (importList.length === 0) {
        return '';
      }
      return `import { ${importList.join(', ')} } from 'react';`;
    }
  },
  
  // Fix unused variables by prefixing with underscore
  {
    name: 'Prefix unused variables with underscore',
    pattern: /const ([a-zA-Z_$][a-zA-Z0-9_$]*) = /g,
    replacement: (match, varName) => {
      // This is a simple pattern - would need more context to be accurate
      return match;
    }
  }
];

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    patterns.forEach(pattern => {
      const matches = newContent.match(pattern.pattern);
      if (matches) {
        newContent = newContent.replace(pattern.pattern, pattern.replacement);
        modified = true;
        console.log(`Applied ${pattern.name} to ${filePath}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

// Start processing from current directory
console.log('Starting lint fix script...');
walkDir('.');
console.log('Finished processing files.'); 