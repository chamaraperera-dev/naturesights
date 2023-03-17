/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
import esbuild from 'esbuild';

const context = await esbuild.context({
  entryPoints: ['src/server.ts'],
  bundle: true,
  minify: true,
  platform: 'node', // for CJS
  outdir: 'dist',
  packages: 'external',
});

// Enable watch mode
await context.watch();
