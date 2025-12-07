/**
 * Icon Generator for Multiplication Table App
 * 
 * This script generates app icons using the 'canvas' package.
 * 
 * To run:
 * 1. npm install canvas
 * 2. node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to load canvas, provide instructions if not available
let createCanvas;
try {
  createCanvas = require('canvas').createCanvas;
} catch (e) {
  console.log('Canvas package not found. Installing...');
  console.log('Please run: npm install canvas');
  console.log('Then run this script again: node scripts/generate-icons.js');
  process.exit(1);
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

function generateIcon(size, filename, isAdaptive = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // For adaptive icons, we need a larger safe zone
  const padding = isAdaptive ? size * 0.15 : 0;
  const innerSize = size - (padding * 2);
  
  // Background gradient (red hues)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#e74c3c');  // Bright red
  gradient.addColorStop(1, '#c0392b');  // Darker red
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Center offset for adaptive icons
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Draw a subtle circular highlight
  const highlightGradient = ctx.createRadialGradient(
    centerX - innerSize * 0.2, centerY - innerSize * 0.2, 0,
    centerX, centerY, innerSize * 0.6
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Vertical offset to move everything up
  const verticalOffset = -innerSize * 0.08;
  
  // Draw "×" symbol (multiplication sign) - smaller
  ctx.fillStyle = 'white';
  ctx.font = `bold ${innerSize * 0.20}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = innerSize * 0.03;
  ctx.shadowOffsetX = innerSize * 0.01;
  ctx.shadowOffsetY = innerSize * 0.01;
  ctx.fillText('×', centerX, centerY - innerSize * 0.05 + verticalOffset);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw numbers (6 × 7) - larger, centered around the × sign
  ctx.font = `bold ${innerSize * 0.26}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  
  // 6 on the left of ×
  ctx.fillText('6', centerX - innerSize * 0.18, centerY - innerSize * 0.05 + verticalOffset);
  // 7 on the right of ×
  ctx.fillText('7', centerX + innerSize * 0.18, centerY - innerSize * 0.05 + verticalOffset);
  
  // Equal sign below the multiplication
  ctx.font = `bold ${innerSize * 0.18}px Arial, sans-serif`;
  ctx.fillText('=', centerX, centerY + innerSize * 0.15 + verticalOffset);
  
  // 42 below the equal sign - slightly smaller
  ctx.font = `bold ${innerSize * 0.20}px Arial, sans-serif`;
  ctx.fillText('42', centerX, centerY + innerSize * 0.30 + verticalOffset);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

function generateSplash(width, height, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient (red hues to match icon)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e74c3c');
  gradient.addColorStop(1, '#c0392b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Center icon
  const iconSize = Math.min(width, height) * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw "×" symbol
  ctx.fillStyle = 'white';
  ctx.font = `bold ${iconSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('×', centerX, centerY - iconSize * 0.1);
  
  // App name
  ctx.shadowBlur = 0;
  ctx.font = `bold ${iconSize * 0.35}px Arial, sans-serif`;
  ctx.fillText('לוח הכפל', centerX, centerY + iconSize * 0.6);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated ${filename} (${width}x${height})`);
}

console.log('🎨 Generating app icons...\n');

// Generate icons
generateIcon(1024, 'icon.png');
generateIcon(1024, 'adaptive-icon.png', true);
generateIcon(48, 'favicon.png');

// Generate splash screen
generateSplash(1284, 2778, 'splash.png');

console.log('\n✅ All icons generated successfully!');
console.log('\nThe icons are saved in the assets/ folder.');

