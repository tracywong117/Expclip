import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
const source=await readFile(new URL('../src/utils/highlightFilters.js',import.meta.url),'utf8')
const {filterHighlights,hasHighlightNote}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const quotes=[{id:1,bookId:'a',text:'Hello',tags:['reading'],note:'Thought',isFavorite:true},
  {id:2,bookId:'b',text:'Hello',tags:['reading'],note:'   '},
  {id:3,bookId:'a',text:'Other',note:'中文'}, {id:4,bookId:'a',text:'Legacy'}]
test('tag and with-note filters combine with existing search, book and favorite filters',()=>{
  const before=JSON.stringify(quotes)
  assert.deepEqual(filterHighlights(quotes,{tag:'reading'}).map(q=>q.id),[1,2])
  assert.deepEqual(filterHighlights(quotes,{withNotes:true}).map(q=>q.id),[1,3])
  assert.deepEqual(filterHighlights(quotes,{tag:'reading',withNotes:true,query:'HELLO',bookId:'a',favoritesOnly:true}).map(q=>q.id),[1])
  assert.deepEqual(filterHighlights(quotes,{tag:'missing'}),[])
  assert.equal(filterHighlights(quotes).length,4)
  assert.equal(JSON.stringify(quotes),before)
})
test('missing, empty and whitespace-only notes do not match',()=>{
  for(const note of [undefined,null,'',' \n '])assert.equal(hasHighlightNote({note}),false)
  assert.equal(hasHighlightNote({note:' note '}),true)
})
