import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
const source=await readFile(new URL('../src/utils/bookRating.js',import.meta.url),'utf8')
const {normalizeRating,visibleStars,nextRating,ratingText,matchesRating}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
test('rating filter matches exact stars including exceptional and unrated books',()=>{
  for(let rating=0;rating<=6;rating++){
    assert.equal(matchesRating(rating,'all'),true)
    for(let selected=0;selected<=6;selected++)assert.equal(matchesRating(rating,String(selected)),rating===selected)
  }
  assert.equal(matchesRating(undefined,'0'),true)
  assert.equal(matchesRating(null,'0'),true)
})
test('clicking the current rating clears to zero at every rating',()=>{
  for(let rating=1;rating<=6;rating++)assert.equal(nextRating(rating,rating),0)
  assert.equal(nextRating(4,2),2)
  assert.equal(nextRating(0,3),3)
})
test('sixth star is only unlocked at five and remains visible at six',()=>{
  for(let rating=0;rating<5;rating++){
    assert.equal(visibleStars(rating),5)
    assert.equal(nextRating(rating,6),rating)
  }
  assert.equal(visibleStars(5),6)
  assert.equal(nextRating(5,6),6)
  assert.equal(visibleStars(6),6)
  assert.equal(nextRating(6,4),4)
  assert.equal(visibleStars(nextRating(6,6)),5)
})
test('grid labels support six stars without extra empty stars',()=>{
  assert.equal(ratingText(6),'★★★★★★')
  assert.equal(ratingText(5),'★★★★★')
  assert.equal(ratingText(0),'☆☆☆☆☆')
  assert.equal(normalizeRating(null),0)
  assert.equal(normalizeRating(99),6)
})
