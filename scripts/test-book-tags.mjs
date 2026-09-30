import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
const helper=await readFile(new URL('../src/utils/tagColors.js',import.meta.url),'utf8')
const {tagColors,tagStyle,matchingTag}=await import(`data:text/javascript;base64,${Buffer.from(helper).toString('base64')}`)
const source=await readFile(new URL('../src/components/BookTagEditor.vue',import.meta.url),'utf8')
const script=source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm,'').replace(/^defineExpose.*$/gm,'')
function setup(forQuote=false){
  const book={id:'a',title:'Test',tags:['History']},other={id:'b',tags:['Reading']}
  const settings={settings:{},updateSetting(key,value){this.settings[key]=value}}
  const books={books:[book,other],updateBook(id,updates){Object.assign(this.books.find(book=>book.id===id),updates)}}
  const quote={id:'q',tags:['Insight'],note:'Keep note'}
  const quotes={quotes:[quote],updateQuote(id,updates){Object.assign(quote,updates)}}
  const ui=new Function('ref','computed','nextTick','onBeforeUnmount','defineProps','useBooksStore','useSettingsStore','tagColors','tagStyle','matchingTag','useQuotesStore',
    script+'\nreturn {query,allTags,matches,canCreate,toggleTag,createTag,setColor,styleFor}')(
    value=>({value}),getter=>({get value(){return getter()}}),async()=>{},()=>{},()=>forQuote?({quote}):({book}),()=>books,()=>settings,tagColors,tagStyle,matchingTag,()=>quotes)
  return {ui,book,other,settings,quote}
}
test('highlight tags use the same picker without modifying book tags or note text',()=>{
  const {ui,book,quote,settings}=setup(true)
  assert.deepEqual(ui.allTags.value,['Insight'])
  ui.query.value='中文';ui.createTag()
  assert.deepEqual(quote.tags,['Insight','中文'])
  ui.setColor('中文','purple')
  assert.equal(settings.settings.highlightTagColors['中文'],'purple')
  assert.equal(settings.settings.bookTagColors,undefined)
  ui.toggleTag('Insight')
  assert.deepEqual(quote.tags,['中文'])
  assert.equal(quote.note,'Keep note')
  assert.deepEqual(book.tags,['History'])
})
test('selecting tags updates only the selected book and preserves removed options',()=>{
  const {ui,book,other}=setup()
  ui.toggleTag('Reading');assert.deepEqual(book.tags,['History','Reading'])
  ui.toggleTag('History');assert.deepEqual(book.tags,['Reading'])
  assert.ok(ui.allTags.value.includes('History'))
  assert.deepEqual(other.tags,['Reading'])
})
test('create trims text and prevents case-insensitive duplicate tags',()=>{
  const {ui,book}=setup()
  ui.query.value='  中文  ';ui.createTag()
  assert.ok(book.tags.includes('中文'));assert.equal(ui.query.value,'')
  ui.query.value='history';assert.equal(ui.canCreate.value,false);ui.createTag()
  assert.equal(book.tags.filter(tag=>tag.toLowerCase()==='history').length,1)
  ui.query.value='   ';ui.createTag();assert.ok(!book.tags.includes(''))
})
test('tag colors save in shared settings and have safe defaults',()=>{
  const {ui,settings}=setup()
  ui.setColor('History','blue')
  assert.equal(settings.settings.bookTagColors.History,'blue')
  assert.deepEqual(ui.styleFor('History'),tagColors.blue)
  assert.deepEqual(tagStyle('missing',{}),tagColors.gray)
  assert.deepEqual(tagStyle('tag',{tag:'not-a-color'}),tagColors.gray)
  ui.setColor('__proto__','green')
  assert.deepEqual(ui.styleFor('__proto__'),tagColors.green)
})
test('tag search matches existing names without changing assignments',()=>{
  const {ui,book}=setup()
  ui.query.value='READ'
  assert.deepEqual(ui.matches.value,['Reading'])
  assert.deepEqual(book.tags,['History'])
})
