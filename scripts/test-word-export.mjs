import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
const require = createRequire(import.meta.url)
const JSZip = createRequire(require.resolve('docx'))('jszip')
let source = await readFile(new URL('../src/utils/wordExporter.js',import.meta.url),'utf8')
for (const dependency of ['docx','file-saver']) source=source.replace(`from '${dependency}'`,`from '${pathToFileURL(require.resolve(dependency)).href}'`)
const { buildHighlightsWord } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const books=[{id:'a',title:'閱讀與阅读',author:'作者'}]
const quotes=[{bookId:'a',text:'繁體中文 & 简体中文 <test>\nSecond line',page:12,location:'905-926',dateHighlighted:'2026-09-26T12:00:00'}]
async function xml(options) {
  const blob=await buildHighlightsWord(options)
  assert.equal(blob.type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  const zip=await JSZip.loadAsync(await blob.arrayBuffer())
  assert.ok(zip.file('[Content_Types].xml'))
  assert.ok(blob.size<100000)
  return {body:await zip.file('word/document.xml').async('string'),styles:await zip.file('word/styles.xml').async('string')}
}
test('Word export preserves Unicode, escaping, line breaks, metadata and headings',async()=>{
  const {body,styles}=await xml({books,quotes})
  assert.match(body,/繁體中文 &amp; 简体中文 &lt;test&gt;/)
  assert.match(body,/<w:br\/>/)
  for(const value of ['閱讀與阅读','作者','Page 12','Location 905-926','2026']) assert.ok(body.includes(value))
  assert.match(body,/w:pStyle w:val="Title"/)
  assert.match(styles,/w:eastAsia="PMingLiU"/)
})
test('details off omits book and location metadata without dropping quotes',async()=>{
  const {body}=await xml({books,quotes,includeDetails:false})
  for(const value of ['閱讀與阅读','作者','Page 12','905-926']) assert.ok(!body.includes(value))
  assert.match(body,/繁體中文/)
})
test('missing books, invalid dates and long quotes are supported',async()=>{
  const text='長篇文字 English paragraph.\n'.repeat(400)
  const {body}=await xml({books:[],quotes:[{text,dateHighlighted:'invalid'}]})
  assert.match(body,/Unknown book/)
  assert.ok(!body.includes('Invalid Date'))
  assert.equal((body.match(/長篇文字/g)||[]).length,400)
})
