
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
// import path from 'path';

export default defineConfig({
    plugins: [preact()],
    build: {
        emptyOutDir: false,
        rollupOptions: {
            input: 'src/index.tsx',
            output: {
                entryFileNames: 'content.js',
                format: 'iife',
                name: 'ReplyBoostWidget', // Add this for IIFE
                assetFileNames: 'boostonx.css'
            }
        },
        // Add these for better compatibility
        target: 'es2015',
        minify: false, // Disable for debugging
        sourcemap: true // Enable for debugging
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});

