// Zips dist/ into bendang-life-web.zip with index.html at the root (itch.io HTML5 upload).
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'

const OUT = 'bendang-life-web.zip'

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html not found. Run `npm run build` first.')
  process.exit(1)
}

rmSync(OUT, { force: true })
try {
  execFileSync('zip', ['-r', '-q', `../${OUT}`, '.'], { cwd: 'dist', stdio: 'inherit' })
} catch {
  console.error('The `zip` command failed or is not installed.')
  process.exit(1)
}
console.log(`Created ${OUT}`)
