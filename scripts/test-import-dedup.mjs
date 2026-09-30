import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

async function loadUtility(name) {
  const source = await readFile(new URL(`../src/utils/${name}.js`, import.meta.url), 'utf8')
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}
const { dataProcessor } = await loadUtility('dataProcessor')
const { clippingIdentity } = await loadUtility('clippingIdentity')
const source = (await readFile(new URL('../src/stores/dataProcessor.js', import.meta.url), 'utf8'))
  .replace(/^import .*$/gm, '').replace('export const useDataProcessorStore', 'const useDataProcessorStore')

function setup() {
  const books = { books: [], addBook(book) {
    const saved = { ...book, id: `book-${this.books.length}`, quoteIds: [] }
    this.books.push(saved); return saved
  }, addQuoteToBook(id, quoteId) { this.books.find(book => book.id === id).quoteIds.push(quoteId) } }
  const quotes = { quotes: [], addQuote(quote) {
    const saved = { ...quote, id: `quote-${this.quotes.length}` }
    this.quotes.push(saved); return saved
  } }
  const store = new Function('defineStore', 'ref', 'useBooksStore', 'useQuotesStore', 'dataProcessor', 'clippingIdentity',
    source + '\nreturn useDataProcessorStore()')(
    (_, factory) => factory, value => ({ value }), () => books, () => quotes, dataProcessor, clippingIdentity)
  return { store, books, quotes }
}
const record = (heading = 'Book (Author)', page = '12', location = '905-926', date = 'April 27, 2015 10:20:16 PM', text = 'A quote') =>
  `${heading}\n- Your Highlight on page ${page} | location ${location} | Added on Monday, ${date}\n\n${text}\n==========\n`

test('duplicates within a file and repeated imports are skipped without modifying annotations', () => {
  const { store, books, quotes } = setup()
  let result = store.parseKindleClippings(record() + record())
  assert.equal(result.quotesProcessed, 1)
  assert.equal(result.duplicatesSkipped, 1)
  quotes.quotes[0].isFavorite = true
  quotes.quotes[0].color = 'pink'
  quotes.quotes[0].tags = ['keep']
  const before = JSON.stringify({ books, quotes })
  result = store.parseKindleClippings(record())
  assert.equal(result.quotesProcessed, 0)
  assert.equal(result.duplicatesSkipped, 1)
  assert.equal(result.booksProcessed, 0)
  assert.equal(JSON.stringify({ books, quotes }), before)
})

test('every differing record field keeps a separate highlight', () => {
  const { store, books } = setup()
  const input = [record(), record('Other (Author)'), record('Book (Other author)'), record('Book (Author)', '13'),
    record('Book (Author)', '12', '999'), record('Book (Author)', '12', '905-926', 'April 27, 2015 10:20:17 PM'),
    record('Book (Author)', '12', '905-926', undefined, 'A  quote')].join('')
  const result = store.parseKindleClippings(input)
  assert.equal(result.quotesProcessed, 7)
  assert.equal(result.duplicatesSkipped, 0)
  assert.equal(books.books.length, 3)
  assert.equal(store.parseKindleClippings(input).duplicatesSkipped, 7)
})

test('missing author and page deduplicate, including Windows line endings', () => {
  const { store } = setup()
  const input = '[HP]住进你心里\n- Your Highlight on Location 905-926 | Added on Monday, April 27, 2015 10:20:16 PM\n\n{Text}\n==========\n'
  assert.equal(store.parseKindleClippings(input).quotesProcessed, 1)
  assert.equal(store.parseKindleClippings(input.replace(/\n/g, '\r\n')).duplicatesSkipped, 1)
})

test('pre-existing highlights are matched by fields without an import fingerprint', () => {
  const { store, books, quotes } = setup()
  books.addBook({ title: 'Book', author: 'Author' })
  quotes.addQuote({ bookId: 'book-0', text: 'A quote\r\n', page: '12', location: '905-926',
    dateHighlighted: new Date('April 27, 2015 10:20:16 PM').toISOString() })
  assert.equal(store.parseKindleClippings(record()).duplicatesSkipped, 1)
})

test('unparseable dates are conservatively retained', () => {
  const { store } = setup()
  const input = record('Book (Author)', '12', '905-926', 'unknown')
  assert.equal(store.parseKindleClippings(input + input).quotesProcessed, 2)
})
