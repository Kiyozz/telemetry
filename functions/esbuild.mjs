import esbuild from 'esbuild'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/** @type {{dependencies: Record<string, string>}} */
const packageJson = JSON.parse((await readFile(resolve('./package.json'))).toString())
const useWatch = process.argv.includes('--watch') || process.argv.includes('-w')

function useDate() {
  return new Date().toLocaleString('fr-FR')
}

await esbuild
  .build({
    format: 'esm',
    bundle: true,
    sourcemap: true,
    platform: 'node',
    entryPoints: ['./src/index.ts'],
    outdir: './lib',
    watch: useWatch,
    external: Object.keys(packageJson.dependencies),
    plugins: [
      {
        name: 'watching',
        setup: builder => {
          builder.onEnd(() => {
            console.log(`${useDate()} - Build complete`)
          })
        },
      },
    ],
  })
  .then(() => {
    if (useWatch) {
      console.log(`${useDate()} - Watching for changes...`)
    }
  })
