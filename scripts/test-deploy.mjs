import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { preparePages, publishPages } from './deploy.mjs'

test('local deployment publishes only build files, preserves CNAME/history and source branch', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'expclip-deploy-test-'))
  const git = (args, cwd = folder) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  try {
    const remote = join(folder, 'remote.git'), source = join(folder, 'source'), dist = join(folder, 'dist')
    git(['init', '--bare', remote])
    await mkdir(source)
    git(['init', '-b', 'main'], source)
    git(['config', 'user.name', 'Deploy test'], source)
    git(['config', 'user.email', 'test@example.invalid'], source)
    await writeFile(join(source, 'source-only.txt'), 'Do not publish')
    git(['add', '.'], source)
    git(['commit', '-m', 'Initial source'], source)
    git(['remote', 'add', 'origin', remote], source)
    git(['push', 'origin', 'main'], source)
    git(['symbolic-ref', 'HEAD', 'refs/heads/main'], remote)
    const original = git(['rev-parse', 'HEAD'], source)
    await mkdir(dist)
    await writeFile(join(dist, 'index.html'), '<h1>First build</h1>')
    await writeFile(join(dist, 'CNAME'), 'example.invalid\n')
    await preparePages(dist)
    assert.equal(await readFile(join(dist, '404.html'), 'utf8'), '<h1>First build</h1>')
    const options = { dist, remote, name: 'Deploy test', email: 'test@example.invalid' }
    await publishPages(options)
    const first = git(['rev-parse', 'gh-pages'], remote)
    assert.equal(git(['ls-tree', '--name-only', 'gh-pages'], remote).includes('source-only.txt'), false)
    assert.equal(git(['show', 'gh-pages:.nojekyll'], remote), '')
    await rm(join(dist, 'CNAME'))
    await writeFile(join(dist, 'index.html'), '<h1>Second build</h1>')
    await preparePages(dist)
    await publishPages(options)
    assert.equal(git(['rev-parse', 'gh-pages^'], remote), first)
    assert.equal(git(['show', 'gh-pages:CNAME'], remote), 'example.invalid')
    const second = git(['rev-parse', 'gh-pages'], remote)
    await publishPages(options)
    assert.equal(git(['rev-parse', 'gh-pages'], remote), second)
    assert.equal(git(['rev-parse', 'HEAD'], source), original)
    assert.equal(git(['branch', '--show-current'], source), 'main')
    assert.equal(git(['status', '--porcelain'], source), '')
  } finally {
    await rm(folder, { recursive: true, force: true })
  }
})
