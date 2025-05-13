import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    }
  ],
  plugins: [
    nodeResolve({
      preferBuiltins: true
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
            node: '14'
          }
        }],
        '@babel/preset-typescript'
      ]
    })
  ],
  external: ['uuid', 'node:crypto']
}; 