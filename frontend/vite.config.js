import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcss from '@tailwindcss/postcss';

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [
                postcss(), // Use the new PostCSS plugin
            ],
        },
    },
});