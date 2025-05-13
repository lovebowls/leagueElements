import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Create a new commit with the version
console.log(`Creating commit for version ${version}...`);
execSync(`git add . && git commit -m "chore: release version ${version}"`, { stdio: 'inherit' });

console.log('Commit created successfully!'); 