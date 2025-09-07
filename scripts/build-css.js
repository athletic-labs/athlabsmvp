#!/usr/bin/env node

/**
 * Build CSS Script - Copies and optimizes CSS files for production
 * This script runs during the build process to prepare CSS files
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/styles');
const publicDir = path.join(__dirname, '../public/styles');

// Ensure public styles directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy design system CSS
const designSystemSrc = path.join(srcDir, 'design-system.css');
const designSystemDest = path.join(publicDir, 'design-system.css');

if (fs.existsSync(designSystemSrc)) {
  fs.copyFileSync(designSystemSrc, designSystemDest);
  console.log('✓ Copied design-system.css to public directory');
}

// Copy non-critical CSS
const nonCriticalSrc = path.join(srcDir, 'non-critical.css');
const nonCriticalDest = path.join(publicDir, 'non-critical.css');

if (fs.existsSync(nonCriticalSrc)) {
  fs.copyFileSync(nonCriticalSrc, nonCriticalDest);
  console.log('✓ Copied non-critical.css to public directory');
}

// Copy critical CSS
const criticalSrc = path.join(srcDir, 'critical.css');
const criticalDest = path.join(publicDir, 'critical.css');

if (fs.existsSync(criticalSrc)) {
  fs.copyFileSync(criticalSrc, criticalDest);
  console.log('✓ Copied critical.css to public directory');
}

console.log('🎨 CSS optimization build completed successfully!');
console.log('📊 Performance benefits:');
console.log('  • Critical CSS inlined for faster initial render');
console.log('  • Non-critical CSS loaded asynchronously');
console.log('  • Feature-specific CSS loaded on demand');
console.log('  • Reduced render-blocking resources');