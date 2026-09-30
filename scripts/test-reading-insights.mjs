import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
const source = await readFile(new URL('../src/utils/readingInsights.js',import.meta.url),'utf8')
const { readingInsights } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const books = [{id:'a',author:'A',tags:['history']},{id:'b',author:'B',tags:['fiction']},{id:'c',author:'C',tags:[]}]
const quotes = [
  {bookId:'a',dateHighlighted:'2025-12-31T23:59:59',isFavorite:true},
  {bookId:'b',dateHighlighted:'2026-01-01T00:00:00'},
  {bookId:'b',dateHighlighted:'2026-09-21T12:00:00',isFavorite:true},
  {bookId:'a',dateHighlighted:'2027-01-01T00:00:00'},
  {bookId:'a',dateHighlighted:'invalid'},
]
test('year selection updates all metrics and rankings using highlight dates',()=>{
  const now=new Date('2026-09-21T15:00:00')
  const all=readingInsights(books,quotes,'All time',now), year=readingInsights(books,quotes,'This year',now)
  assert.equal(all.bookCount,3);assert.equal(all.quoteCount,5)
  assert.equal(year.bookCount,1);assert.equal(year.quoteCount,2)
  assert.equal(year.authorCount,1);assert.equal(year.favoriteCount,1)
  assert.equal(year.tagCount,1);assert.equal(year.average,'2.0')
  assert.deepEqual(year.topBooks.map(b=>b.id),['b'])
  assert.deepEqual(year.topAuthors.map(a=>a.name),['B'])
  assert.equal(year.monthly.length,12)
  assert.deepEqual(year.monthly.filter(m=>m.count).map(m=>m.key),['2026-01','2026-09'])
  assert.equal(year.yearlyTotal,2);assert.equal(year.activeDays,2)
  assert.equal(all.yearlyTotal,2)
  assert.equal(year.heatmapDays.find(d=>d.key==='2025-12-31').outside,true)
  assert.equal(year.heatmapDays.find(d=>d.key==='2026-09-22').future,true)
  assert.deepEqual(year.monthly.map(m=>m.label),['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])
  assert.equal(year.monthly[9].future,true)
})
test('months sort numerically; dateAdded is a fallback',()=>{
  const input=[9,10,11].map(month=>({bookId:'a',dateAdded:`2026-${String(month).padStart(2,'0')}-01T12:00:00`}))
  const result=readingInsights(books,input,'This year',new Date('2026-12-31T12:00:00'))
  assert.deepEqual(result.monthly.filter(m=>m.count).map(m=>m.key),['2026-09','2026-10','2026-11'])
  assert.equal(result.yearlyTotal,3)
})
test('empty year has zero metrics and twelve zero-height monthly bars',()=>{
  const result=readingInsights(books,quotes,'This year',new Date('2030-01-01T12:00:00'))
  assert.equal(result.bookCount,0);assert.equal(result.average,'0')
  assert.equal(result.quoteCount,0);assert.equal(result.yearlyTotal,0)
  assert.equal(result.monthly.length,12);assert.ok(result.monthly.every(m=>m.height===0));assert.deepEqual(result.topBooks,[])
  assert.equal(result.heatmapDays.filter(day=>!day.outside).length,365)
})
test('all-time chart groups by year, includes empty intervening years, and keeps older history',()=>{
  const input=[2012,2012,2014,2026].map(year=>({bookId:'a',dateHighlighted:`${year}-06-01T12:00:00`}))
  const result=readingInsights(books,input,'All time',new Date('2026-09-21T12:00:00'))
  assert.equal(result.yearly.length,15)
  assert.equal(result.yearly[0].label,'2012')
  assert.equal(result.yearly[0].count,2)
  assert.equal(result.yearly[1].count,0)
  assert.equal(result.yearly[1].height,0)
  assert.equal(result.yearly.at(-1).count,1)
  assert.equal(result.yearly.reduce((sum,row)=>sum+row.count,0),4)
})
test('calendar selection includes January 1 and today but excludes prior year and future days',()=>{
  const input=['2025-12-31T23:59:59','2026-01-01T00:00:00','2026-09-21T23:59:59','2026-09-22T00:00:00']
    .map(dateHighlighted=>({bookId:'a',dateHighlighted}))
  const result=readingInsights(books,input,'This year',new Date('2026-09-21T12:00:00'))
  assert.equal(result.quoteCount,2)
  assert.equal(result.yearlyTotal,2)
  assert.equal(result.heatmapDays.filter(day=>!day.outside).length,365)
})
test('calendar heatmap includes leap day and twelve non-overlapping month labels',()=>{
  const result=readingInsights([],[],'All time',new Date('2024-12-31T12:00:00'))
  assert.equal(result.heatmapDays.filter(day=>!day.outside).length,366)
  assert.equal(result.heatmapDays.length%7,0)
  assert.equal(result.heatmapMonths.length,12)
  result.heatmapMonths.slice(1).forEach((month,index)=>assert.ok(month.column-result.heatmapMonths[index].column>=3))
})
