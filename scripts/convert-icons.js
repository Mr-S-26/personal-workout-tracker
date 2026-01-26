// Convert SVG icons to PNG
// Run with: node scripts/convert-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

async function convertIcons() {
  for (const size of sizes) {
    const svgPath = path.join(__dirname, '..', 'public', `icon-${size}.svg`);
    const pngPath = path.join(__dirname, '..', 'public', `icon-${size}.png`);

    try {
      const svgBuffer = fs.readFileSync(svgPath);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✓ Created icon-${size}.png`);
    } catch (error) {
      console.error(`✗ Error creating icon-${size}.png:`, error.message);
    }
  }

  console.log('\nPWA icons generated successfully!');
}

convertIcons();
