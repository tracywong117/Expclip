import { execFileSync } from 'node:child_process'
import { cp, copyFile, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

export async function preparePages(dist) {
  await copyFile(join(dist, 'index.html'), join(dist, '404.html'))
  await writeFile(join(dist, '.nojekyll'), '')
}

export async function publishPages({ dist, remote, name, email }) {
  const staging = await mkdtemp(join(tmpdir(), 'expclip-pages-'))
  try {
    // All branch changes happen in an isolated clone, never in the source repo.
    git(['clone', '--no-checkout', '--depth', '1', '--no-single-branch', remote, staging])
    const branches = git(['branch', '-r', '--list', 'origin/gh-pages'], staging)
    if (branches) git(['checkout', '-b', 'gh-pages', 'origin/gh-pages'], staging)
    else git(['checkout', '--orphan', 'gh-pages'], staging)
    let cname
    try { cname = await readFile(join(staging, 'CNAME')) } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    // This directory is a disposable clone created above.
    for (const entry of await readdir(staging)) {
      if (entry !== '.git') await rm(join(staging, entry), { recursive: true, force: true })
    }
    for (const entry of await readdir(dist)) {
      if (entry === '.git') throw new Error('Unexpected .git directory in build output.')
      await cp(join(dist, entry), join(staging, entry), { recursive: true })
    }
    if (cname && !(await readdir(dist)).includes('CNAME')) await writeFile(join(staging, 'CNAME'), cname)
    git(['add', '--all'], staging)
    if (!git(['status', '--porcelain'], staging)) {
      console.log('The published site is already up to date.')
      return
    }
    git(['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-m', 'Deploy Expclip'], staging)
    // Normal push preserves history and rejects concurrent updates; never force-push.
    git(['push', 'origin', 'HEAD:refs/heads/gh-pages'], staging)
    console.log('Published build output to gh-pages.')
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.some(arg => arg !== '--dry-run')) throw new Error('Usage: npm run deploy [-- --dry-run]')
    const dist = join(root, 'dist')
    await preparePages(dist)
    if (args.includes('--dry-run')) {
      console.log('Prepared dist/ with .nojekyll and 404.html. No commits or pushes made.')
    } else {
      console.log('Publishing dist/ (including any installed font and license) to origin/gh-pages.')
      await publishPages({
        dist,
        remote: git(['remote', 'get-url', '--push', 'origin']),
        name: git(['config', 'user.name']),
        email: git(['config', 'user.email']),
      })
    }
  } catch (error) {
    console.error(`Deployment failed: ${error.message}`)
    process.exitCode = 1
  }
}
