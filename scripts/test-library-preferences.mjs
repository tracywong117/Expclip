import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {reactive} from 'vue'
import {test} from 'node:test'
const require=createRequire(import.meta.url)
const source=(await readFile(new URL('../src/utils/libraryPreferences.js',import.meta.url),'utf8'))
  .replace("from 'vue'",`from '${pathToFileURL(require.resolve('vue')).href}'`)
const {libraryPreferences}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const storeFor=settings=>({settings:reactive(settings),updateSetting(key,value){this.settings[key]=value}})
test('Library selections survive component remount and saved-settings reload',()=>{
  const store=storeFor({bookTagColors:{History:'blue'}})
  const first=libraryPreferences(store)
  assert.equal(first.view.value,'grid')
  first.query.value='中文'
  first.selectedTag.value='History'
  first.view.value='list'
  first.bookOrder.value='date-desc'
  first.selectedRating.value='6'
  for(const current of [libraryPreferences(store),libraryPreferences(storeFor(JSON.parse(JSON.stringify(store.settings))))]){
    assert.equal(current.query.value,'中文')
    assert.equal(current.selectedTag.value,'History')
    assert.equal(current.view.value,'list')
    assert.equal(current.bookOrder.value,'date-desc')
    assert.equal(current.selectedRating.value,'6')
  }
  assert.deepEqual(store.settings.bookTagColors,{History:'blue'})
})
test('invalid saved preferences fall back safely and resetting settings restores defaults',()=>{
  const store=storeFor({libraryPreferences:{view:'invalid',bookOrder:null,query:42,selectedTag:[]}})
  const prefs=libraryPreferences(store)
  assert.equal(prefs.view.value,'grid');assert.equal(prefs.bookOrder.value,'title-asc')
  assert.equal(prefs.query.value,'');assert.equal(prefs.selectedTag.value,'')
  assert.equal(prefs.selectedRating.value,'all')
  prefs.view.value='list'
  store.updateSetting('libraryPreferences',{})
  assert.equal(prefs.view.value,'grid')
})
