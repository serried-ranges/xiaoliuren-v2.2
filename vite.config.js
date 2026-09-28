import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    base: './',
    plugins: [viteSingleFile()],
    build: {
        target: 'es2018',
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    }
});