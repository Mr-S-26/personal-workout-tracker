// Simple script to generate PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create simple SVG icons in different sizes
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <g fill="#FFFFFF">
    <!-- Dumbbell icon -->
    <rect x="${size * 0.1875}" y="${size * 0.4609}" width="${size * 0.625}" height="${size * 0.078125}" rx="${size * 0.015625}"/>
    <circle cx="${size * 0.1875}" cy="${size * 0.5}" r="${size * 0.1171875}"/>
    <circle cx="${size * 0.8125}" cy="${size * 0.5}" r="${size * 0.1171875}"/>
    <circle cx="${size * 0.1875}" cy="${size * 0.5}" r="${size * 0.078125}" fill="#000000"/>
    <circle cx="${size * 0.8125}" cy="${size * 0.5}" r="${size * 0.078125}" fill="#000000"/>
  </g>
  <text x="${size * 0.5}" y="${size * 0.78125}" font-family="Arial, sans-serif" font-size="${size * 0.09375}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">WORKOUT</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
});

console.log('\nSVG icons created! For PNG conversion, use an online tool or:');
console.log('npm install sharp');
console.log('Then convert SVG to PNG using sharp or an online converter.');
