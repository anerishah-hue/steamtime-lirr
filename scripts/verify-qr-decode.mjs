import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';

// 1. Render QRCodeSVG with exact production settings
const TARGET_URL = 'https://steamtime-lirr.vercel.app';
const svgString = ReactDOMServer.renderToStaticMarkup(
  React.createElement(QRCodeSVG, {
    value: TARGET_URL,
    size: 240,
    level: 'M',
    bgColor: '#ffffff',
    fgColor: '#000000',
    marginSize: 4
  })
);

// 2. Extract viewBox dimensions (e.g., "0 0 37 37")
const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
if (!viewBoxMatch) {
  throw new Error('viewBox not found in SVG');
}
const gridWidth = parseInt(viewBoxMatch[1], 10);
const gridHeight = parseInt(viewBoxMatch[2], 10);

console.log(`Grid dimensions: ${gridWidth}x${gridHeight} modules (including margin)`);

// 3. Initialize grid (0 = white, 1 = black)
const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

// 4. Extract ONLY the black modules path: <path fill="#000000" d="..."
const blackPathMatch = svgString.match(/<path[^>]*fill="#000000"[^>]*d="([^"]+)"/);
if (!blackPathMatch) {
  throw new Error('Black modules path not found');
}
const blackD = blackPathMatch[1];

// Format: M<x> <y>h<w>v1H<x>z or M<x>,<y> h<w>v1H<x>z
const pathRegex = /M(\d+)[,\s]+(\d+)\s*h(\d+)/g;
let match;
let blackCount = 0;

while ((match = pathRegex.exec(blackD)) !== null) {
  const startX = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);
  const w = parseInt(match[3], 10);
  for (let dx = 0; dx < w; dx++) {
    const x = startX + dx;
    if (x < gridWidth && y < gridHeight) {
      grid[y][x] = 1;
      blackCount++;
    }
  }
}

console.log(`Total black modules: ${blackCount}`);

// 5. Verify Quiet Zone (at least 4 modules margin on all four sides)
let quietZoneViolations = 0;
for (let y = 0; y < gridHeight; y++) {
  for (let x = 0; x < gridWidth; x++) {
    // If within 4 modules from border, must be 0 (pure white)
    if (x < 4 || x >= gridWidth - 4 || y < 4 || y >= gridHeight - 4) {
      if (grid[y][x] === 1) {
        quietZoneViolations++;
        console.error(`Violation: Black module found in quiet zone at (${x}, ${y})`);
      }
    }
  }
}

console.log(`Quiet zone violations: ${quietZoneViolations}`);
console.log(`Quiet zone (>= 4 modules pure white padding) intact: ${quietZoneViolations === 0}`);

// 6. Scale grid to high-resolution RGBA image for jsQR decoder
const SCALE = 8; // 8x8 pixels per QR module
const imgWidth = gridWidth * SCALE;
const imgHeight = gridHeight * SCALE;
const rgbaData = new Uint8ClampedArray(imgWidth * imgHeight * 4);

for (let y = 0; y < gridHeight; y++) {
  for (let x = 0; x < gridWidth; x++) {
    const isDark = grid[y][x] === 1;
    const color = isDark ? 0 : 255; // 0 for black, 255 for white

    for (let dy = 0; dy < SCALE; dy++) {
      for (let dx = 0; dx < SCALE; dx++) {
        const px = (x * SCALE + dx);
        const py = (y * SCALE + dy);
        const idx = (py * imgWidth + px) * 4;
        rgbaData[idx] = color;     // R
        rgbaData[idx + 1] = color; // G
        rgbaData[idx + 2] = color; // B
        rgbaData[idx + 3] = 255;   // Alpha
      }
    }
  }
}

// 7. Decode using jsQR
const code = jsQR(rgbaData, imgWidth, imgHeight);

if (!code) {
  console.error('jsQR failed to decode QR code!');
  process.exit(1);
}

console.log('\n=== QR DECODE VERIFICATION RESULT ===');
console.log('Decoded text:', code.data);
console.log('Matches expected URL:', code.data === TARGET_URL);

if (code.data !== TARGET_URL) {
  console.error(`ERROR: Decoded text "${code.data}" does not match target "${TARGET_URL}"`);
  process.exit(1);
}

console.log('SUCCESS: QR code decodes 100% identically to target URL!\n');
