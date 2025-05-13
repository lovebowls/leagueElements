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
  'leagueAdminElement'
];

export default elements.map(element => ({
  input: `src/${element}.js`,
  output: {
    file: `dist/browser/${element}.js`,
    format: 'iife',
    name: element.replace(/^./, c => c.toUpperCase()), // Capitalize first letter
    sourcemap: true,
    globals: {
      'wix-window': 'wixWindow',
      'wix-location': 'wixLocation',
      'wix-data': 'wixData',
      'wix-http-functions': 'wixHttpFunctions'
    }
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      tsconfig: pathResolve(__dirname, 'tsconfig.json'),
      sourceMap: true,
      declaration: false
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['last 2 versions', 'not dead']
          }
        }],
        '@babel/preset-typescript'
      ]
    })
  ],
  external: [
    'wix-window',
    'wix-location',
    'wix-data',
    'wix-http-functions'
  ]
})); 