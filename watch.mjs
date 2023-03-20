import esbuild from 'esbuild';

// Enable watch mode

const context = await esbuild.context({
  entryPoints: ['src/server.ts'],
  bundle: true,
  minify: true,
  platform: 'node', // for CJS
  outdir: 'dist',
  packages: 'external',
});

await context.watch();
