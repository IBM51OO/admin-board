import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                additionalData: `
                @import "/src/assets/mixins.scss";`
            }
        }
    },
    plugins: [
        vue(),
        vueDevTools(),
        svgLoader()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            find: '@vueup/vue-quill',
            replacement: path.resolve(__dirname, '../packages/vue-quill/src')
        },
    },
})
