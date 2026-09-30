import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
const component=await readFile(new URL('../src/components/QuoteContent.vue',import.meta.url),'utf8')
const script=component.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm,'')
function setup(quote) {
  const updates=[]
  const listeners=new Map()
  const document={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)}
  const ui=new Function('ref','computed','nextTick','onBeforeUnmount','defineProps','useBooksStore','useQuotesStore','document',
    script+'\nreturn {startAnnotations,saveAnnotations,draftNote,annotationEditing,toggleMoreMenu,menuOpen,moreActions,menuTagEditor}')(
    value=>({value}),getter=>({get value(){return getter()}}),async()=>{},()=>{},()=>({quote}),()=>({getBookById:()=>null}),
    ()=>({updateQuote:(id,value)=>updates.push({id,value})}),document)
  return {ui,updates,listeners}
}
test('outside pointer closes the menu but interactions in its tag popup do not',()=>{
  const {ui,listeners}=setup({id:'q'})
  ui.moreActions.value={contains:target=>target==='inside'}
  ui.menuTagEditor.value={containsTarget:target=>target==='tag-popup'}
  ui.toggleMoreMenu()
  listeners.get('pointerdown')({target:'inside'})
  assert.equal(ui.menuOpen.value,true)
  listeners.get('pointerdown')({target:'tag-popup'})
  assert.equal(ui.menuOpen.value,true)
  listeners.get('pointerdown')({target:'outside'})
  assert.equal(ui.menuOpen.value,false)
  assert.equal(listeners.size,0)
  ui.toggleMoreMenu();ui.toggleMoreMenu()
  assert.equal(ui.menuOpen.value,false)
  assert.equal(listeners.size,0)
})
test('notes edit in drafts and save without overwriting tags',()=>{
  const quote={id:'q',text:'Original',note:'My note',tags:['reading'],isFavorite:true}
  const {ui,updates}=setup(quote)
  ui.startAnnotations()
  assert.equal(ui.draftNote.value,'My note')
  ui.draftNote.value=' Updated\nChinese 中文 '
  assert.equal(quote.note,'My note')
  assert.equal(updates.length,0)
  ui.saveAnnotations()
  assert.deepEqual(updates,[{id:'q',value:{note:'Updated\nChinese 中文'}}])
  assert.deepEqual(quote.tags,['reading'])
  assert.equal(ui.annotationEditing.value,false)
  assert.equal(quote.text,'Original')
})
test('legacy highlights without annotations support adding and clearing notes',()=>{
  const {ui,updates}=setup({id:'q'})
  ui.startAnnotations()
  assert.equal(ui.draftNote.value,'')
  ui.saveAnnotations()
  assert.deepEqual(updates[0].value,{note:''})
})
