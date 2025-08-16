import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { analyzer, unstableRolldownAdapter } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        unstableRolldownAdapter(
            analyzer({
                // @ts-ignore
                enabled: process.env.ANALYZE === 'true'
            })
        )
    ],
    experimental: {
        enableNativePlugin: true
    }
})
