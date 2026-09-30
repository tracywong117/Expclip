import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(new URL('../src/utils/pdfExporter.js', import.meta.url), 'utf8')
const loader = source.slice(source.indexOf('let fontRequest'), source.indexOf('// fontBytes'))
  .replace('import.meta.env.BASE_URL', "'/Expclip/'")
let instance = 0
async function freshLoader() {
  const module = `${loader}\nexport { loadFont };\n// instance ${instance++}`
  return (await import(`data:text/javascript;base64,${Buffer.from(module).toString('base64')}`)).loadFont
}

test('PDF font loading explains setup for missing files and HTML fallback responses', async t => {
  for (const response of [new Response('', { status: 404 }), new Response('<!doctype html>'), new Response('')]) {
    const loadFont = await freshLoader()
    t.mock.method(globalThis, 'fetch', async () => response)
    await assert.rejects(loadFont(), /Follow public\/fonts\/README.md/)
    t.mock.restoreAll()
  }
})

test('PDF font loading retries after failure and caches valid TrueType data', async t => {
  const loadFont = await freshLoader()
  const bytes = new Uint8Array([0, 1, 0, 0, 12, 34])
  let calls = 0
  t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url, '/Expclip/fonts/ExpclipReadingSerif-Regular.ttf')
    calls++
    return calls === 1 ? new Response('', { status: 404 }) : new Response(bytes)
  })
  await assert.rejects(loadFont(), /PDF font is missing or invalid/)
  assert.deepEqual(new Uint8Array(await loadFont()), bytes)
  await loadFont()
  assert.equal(calls, 2)
})
