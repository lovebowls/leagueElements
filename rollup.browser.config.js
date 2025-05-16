import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of elements to bundle (excluding elementTemplate)
const elements = [
  'leagueElement',
  'LeagueMatchesRecent',
  'leagueAdminElement',
  'LeagueMatchesAttention',
  'LeagueMatchesUpcoming',
  'leagueMatch'
];

// Define common globals for all bundles
const globals = {
  'wix-window': 'wixWindow',
  'wix-location': 'wixLocation',
  'wix-data': 'wixData',
  'wix-http-functions': 'wixHttpFunctions',
  '@js-temporal/polyfill': 'temporal'
};

// Define external modules - those that won't be bundled
const externals = [
  'wix-window',
  'wix-location',
  'wix-data',
  'wix-http-functions'
];

// Common plugins configuration
const getPlugins = () => [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    // Don't exclude node_modules - this allows @js-temporal/polyfill to be bundled
    // while the externals array will still exclude the specified external modules
    dedupe: ['@js-temporal/polyfill']
  }),
  typescript({
    tsconfig: false, // Don't use the tsconfig file directly
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      sourceMap: true,
      declaration: false, // Don't generate declaration files in the rollup process
      declarationMap: false // Don't generate declaration maps in the rollup process
    }
  }),
  babel({
    babelHelpers: 'bundled',
    exclude: ['node_modules/**', '!**/node_modules/@js-temporal/**'], // Exclude all node_modules except @js-temporal
    presets: [
      ['@babel/preset-env', {
        targets: {
          browsers: ['last 2 versions', 'not dead']
        }
      }],
      '@babel/preset-typescript'
    ]
  })
];

// Create configurations for individual elements
const elementConfigs = elements.map(element => ({
  input: `src/elements/${element}.js`,
  output: {
    file: `dist/browser/${element}.js`,
    format: 'iife',
    name: element.replace(/^./, c => c.toUpperCase()), // Capitalize first letter
    sourcemap: true,
    globals
  },
  plugins: getPlugins(),
  external: externals
}));

// Add the bundle configuration
const bundleConfig = {
  input: 'src/leagueElement.bundle.js',
  output: {
    file: 'dist/browser/leagueElement.bundle.js',
    format: 'iife',
    name: 'LeagueElementBundle',
    sourcemap: true,
    globals
  },
  plugins: getPlugins(),
  external: externals
};

// Export both configurations
export default [...elementConfigs, bundleConfig]; 