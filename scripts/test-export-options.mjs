import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
const source=await readFile(new URL('../src/utils/exportOptions.js',import.meta.url),'utf8')
const {selectExportQuotes,serializeTextExport,sortLibraryBooks,firstHighlightDates}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const books=[{id:'b',title:'Beta',author:'B'},{id:'a',title:'Alpha',author:'A'}]
const quotes=[
  {id:'b1',bookId:'b',text:'B quote',location:'2',dateHighlighted:'2026-09-20T10:00:00'},
  {id:'a1',bookId:'a',text:'中文, "quote"\nnext',location:'100-120',dateHighlighted:'2026-09-22T10:00:00',isFavorite:true},
  {id:'b2',bookId:'b',text:'B2',location:'10',dateHighlighted:'2026-09-23T10:00:00'},
  {id:'a2',bookId:'a',text:'A2',location:'9',dateHighlighted:'2026-09-21T23:59:59'},
  {id:'a3',bookId:'a',text:'A3',location:'',dateHighlighted:'invalid'},
]
const ids=options=>selectExportQuotes(quotes,books,options).map(q=>q.id)
test('Library sorts titles and first highlights in both directions without dropping empty books',()=>{
  const library=[...books,{id:'c',title:'Gamma'}]
  const before=JSON.stringify(library)
  const order=value=>sortLibraryBooks(library,quotes,value).map(book=>book.id)
  assert.deepEqual(order('title-asc'),['a','b','c'])
  assert.deepEqual(order('title-desc'),['c','b','a'])
  assert.deepEqual(order('date-desc'),['a','b','c'])
  assert.deepEqual(order('date-asc'),['b','a','c'])
  assert.equal(firstHighlightDates(quotes).get('b'),new Date('2026-09-20T10:00:00').getTime())
  assert.equal(JSON.stringify(library),before)
})
test('book order uses earliest highlight, not date added, with missing dates last',()=>{
  const datedBooks=[{id:'a',dateAdded:'2026-09-25'},{id:'b',dateAdded:'2026-09-26'},{id:'c',dateAdded:'invalid'},{id:'d'}]
  const input=[{id:'c1',bookId:'c'},...quotes,{id:'d1',bookId:'d'}]
  assert.deepEqual(selectExportQuotes(input,datedBooks,{bookOrder:'date-desc',sortBy:'location',direction:'desc'}).map(q=>q.id),
    ['a1','a2','a3','b2','b1','c1','d1'])
})
test('first highlight date uses full history even when earlier highlights are filtered out',()=>{
  const input=[
    {id:'a-old',bookId:'a',dateHighlighted:'2020-01-01'},
    {id:'a-new',bookId:'a',dateHighlighted:'2026-09-26',isFavorite:true},
    {id:'b-first',bookId:'b',dateHighlighted:'2025-01-01',isFavorite:true},
  ]
  assert.deepEqual(selectExportQuotes(input,books,{bookOrder:'date-desc',favoritesOnly:true}).map(q=>q.id),['b-first','a-new'])
})
test('all sorting keeps book groups contiguous and does not mutate input',()=>{
  const before=JSON.stringify(quotes)
  assert.deepEqual(ids(),['a2','a1','a3','b1','b2'])
  assert.deepEqual(ids({direction:'desc'}),['a1','a2','a3','b2','b1'])
  assert.deepEqual(ids({sortBy:'location'}),['a2','a1','a3','b1','b2'])
  assert.deepEqual(ids({sortBy:'location',direction:'desc'}),['a1','a2','a3','b2','b1'])
  assert.deepEqual(ids({bookOrder:'title-desc'}),['b1','b2','a2','a1','a3'])
  assert.deepEqual(ids({bookOrder:'library'}),['b1','b2','a2','a1','a3'])
  assert.equal(JSON.stringify(quotes),before)
})
test('book selection, favorites and inclusive local date ranges combine',()=>{
  assert.deepEqual(ids({bookIds:[]}),[])
  assert.deepEqual(ids({bookIds:['b']}),['b1','b2'])
  assert.deepEqual(ids({bookIds:['a'],favoritesOnly:true}),['a1'])
  assert.deepEqual(ids({dateFrom:'2026-09-21',dateTo:'2026-09-22'}),['a2','a1'])
})
test('same starting locations use range end; unknown values always last',()=>{
  const input=['9-20','9-10','n/a','9'].map((location,id)=>({id,bookId:'a',location}))
  assert.deepEqual(selectExportQuotes(input,books,{sortBy:'location'}).map(q=>q.id),[3,1,0,2])
  assert.deepEqual(selectExportQuotes(input,books,{sortBy:'location',direction:'desc'}).map(q=>q.id),[0,1,3,2])
})
test('CSV preserves Chinese and escaped fields and honors metadata toggle',()=>{
  const result=serializeTextExport([quotes[1]],books,{format:'csv'})
  assert.ok(result.startsWith('\uFEFFQuote,Book,Author'))
  assert.ok(result.includes('"中文, ""quote""\nnext"'))
  const plain=serializeTextExport([quotes[1]],books,{format:'csv',includeDetails:false})
  assert.ok(plain.startsWith('\uFEFFQuote\r\n'))
  assert.ok(!plain.includes('Alpha'))
})
test('plain text groups book headings once and supports quote-only output',()=>{
  const selected=selectExportQuotes(quotes,books)
  const result=serializeTextExport(selected,books)
  assert.equal(result.split('Alpha').length-1,1)
  assert.equal(result.split('Beta').length-1,1)
  assert.ok(result.includes('Location 100-120'))
  assert.equal(serializeTextExport([quotes[1]],books,{includeDetails:false}),quotes[1].text)
})
