import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
mkdirSync(new URL('./.compiled', import.meta.url), { recursive: true })
try {
  execFileSync('node', ['node_modules/typescript/bin/tsc', '--ignoreConfig', 'src/lib/observations.ts', '--target', 'es2023', '--module', 'esnext', '--skipLibCheck', '--outDir', 'tests/.compiled'], { cwd: root, stdio: 'inherit' })
  execFileSync('node', ['--test', 'tests/domain.test.mjs'], { cwd: root, stdio: 'inherit' })
} finally { rmSync(new URL('./.compiled', import.meta.url), { recursive: true, force: true }) }
