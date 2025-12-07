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
  
  // Background gradient (purple to blue - matching app theme)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
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
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw "×" symbol (multiplication sign)
  ctx.fillStyle = 'white';
  ctx.font = `bold ${innerSize * 0.55}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = innerSize * 0.05;
  ctx.shadowOffsetX = innerSize * 0.02;
  ctx.shadowOffsetY = innerSize * 0.02;
  ctx.fillText('×', centerX, centerY);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw small numbers (6 × 7 style)
  ctx.font = `bold ${innerSize * 0.18}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Top left: 6
  ctx.fillText('6', centerX - innerSize * 0.28, centerY - innerSize * 0.28);
  // Top right: 7
  ctx.fillText('7', centerX + innerSize * 0.28, centerY - innerSize * 0.28);
  
  // Bottom: =42
  ctx.font = `bold ${innerSize * 0.16}px Arial, sans-serif`;
  ctx.fillText('=42', centerX, centerY + innerSize * 0.38);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

function generateSplash(width, height, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
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

