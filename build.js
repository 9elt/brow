const build = await Bun.build({
    entrypoints: ['src/index.ts'],
    outdir: '.',
    target: 'node',
    minify: true,
});

if (!build.success) {
    console.error(build);
    process.exit(1);
}
