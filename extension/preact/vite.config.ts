
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
// import path from 'path';

export default defineConfig({
    plugins: [preact()],
    // root: 'preact', // your actual source folder
    build: {
        // outDir: '../', // put result in extension root
        emptyOutDir: false,
        rollupOptions: {
            input: 'src/index.tsx',
            output: {
                entryFileNames: 'content.js', // forces output filename
                format: 'iife',               // ensures one self-contained file
                assetFileNames: 'boostonx.css' // keep CSS/assets if needed
            }
        }
    }
});

