import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Build the package
console.log('Building package...');
execSync('npm run build', { stdio: 'inherit' });

// Update version in package.json
console.log(`Updating version to ${version}...`);
writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

console.log('Build complete!'); 