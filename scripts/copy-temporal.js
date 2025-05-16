import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const srcPath = path.resolve(__dirname, '../src/libs/temporal-polyfill.js');
const distPath = path.resolve(__dirname, '../dist/browser/temporal-polyfill.js');

// Make sure the dist directory exists
const distDir = path.dirname(distPath);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(srcPath, distPath);
  console.log(`Successfully copied temporal-polyfill.js to ${distPath}`);
} catch (error) {
  console.error('Error copying temporal-polyfill.js:', error);
} 