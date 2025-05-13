import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'version':
    console.log(`Current version: ${version}`);
    break;
  case 'build':
    execSync('npm run build', { stdio: 'inherit' });
    break;
  case 'test':
    execSync('npm run test', { stdio: 'inherit' });
    break;
  default:
    console.log('Available commands:');
    console.log('  version - Show current version');
    console.log('  build   - Build the package');
    console.log('  test    - Run tests');
    process.exit(1);
} 