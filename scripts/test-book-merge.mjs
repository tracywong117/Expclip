import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = (await readFile(new URL('../src/stores/books.js', import.meta.url), 'utf8'))
  .replace(/^import .*$/gm, '').replace('export const useBooksStore', 'const useBooksStore')
function setup() {
  const quotes = { quotes: [], updateQuote(id, updates) { Object.assign(this.quotes.find(q => q.id === id), updates) } }
  const notes = { notes: [], updateNote(id, updates) { Object.assign(this.notes.find(n => n.id === id), updates) } }
  quotes.deleteQuote = id => { quotes.quotes = quotes.quotes.filter(quote => quote.id !== id) }
  notes.deleteNote = id => { notes.notes = notes.notes.filter(note => note.id !== id) }
  let id = 0
  const store = new Function('defineStore', 'ref', 'computed', 'watch', 'generateBookId', 'StorageService', 'useQuotesStore', 'useNotesStore',
    source + '\nreturn useBooksStore()')((_, factory) => factory, value => ({ value }), getter => ({ get value() { return getter() } }),
    () => {}, () => `book-${id++}`, { loadBooks: () => [] }, () => quotes, () => notes)
  return { store, quotes, notes }
}

test('deleting a book removes all related highlights and notes but preserves other books', () => {
  const { store, quotes, notes } = setup()
  const book = store.addBook({title:'Delete',author:'A',quoteIds:['other-quote'],noteIds:['direct-note']})
  const other = store.addBook({title:'Keep',author:'B'})
  quotes.quotes.push({id:'q',bookId:book.id,note:'annotation',tags:['tag']},{id:'other-quote',bookId:other.id})
  notes.notes.push({id:'linked',quoteId:'q'},{id:'book-note',bookId:book.id},
    {id:'legacy',bookTitle:'Delete'},{id:'direct-note'},{id:'keep',bookId:other.id})
  assert.equal(store.deleteBook(book.id),true)
  assert.deepEqual(store.books.value.map(b=>b.id),[other.id])
  assert.deepEqual(quotes.quotes.map(q=>q.id),['other-quote'])
  assert.deepEqual(notes.notes.map(n=>n.id),['keep'])
  const after=JSON.stringify({books:store.books.value,quotes,notes})
  assert.equal(store.deleteBook(book.id),false)
  assert.equal(JSON.stringify({books:store.books.value,quotes,notes}),after)
})

test('deleting an empty book leaves ambiguous title-only notes intact', () => {
  const { store, notes } = setup()
  const first=store.addBook({title:'Shared',author:'A'})
  const second=store.addBook({title:'Shared',author:'B'})
  notes.notes.push({id:'unknown',bookTitle:'Shared'})
  assert.equal(store.deleteBook(first.id),true)
  assert.equal(store.getBookById(second.id).title,'Shared')
  assert.equal(notes.notes.length,1)
})

test('exact title and author merge books and retain quote IDs and annotations', () => {
  const { store, quotes, notes } = setup()
  const target = store.addBook({ title: 'Title', author: 'Author', tags: ['a'], cover: 'target.jpg', stars: 2 })
  const source = store.addBook({ title: 'Old', author: '', tags: ['b'], stars: 4, isFavorite: true })
  const other = store.addBook({ title: 'Other', author: 'Author' })
  quotes.quotes.push({ id: 'q1', bookId: target.id }, { id: 'q2', bookId: source.id, text: 'Keep', color: 'pink', isFavorite: true, tags: ['tag'] }, { id: 'q3', bookId: other.id })
  notes.notes.push({ id: 'n1', quoteId: 'q2', content: 'Keep note' }, { id: 'n2', bookTitle: 'Old', content: 'Legacy note' })
  const result = store.updateBook(source.id, { title: 'Title', author: 'Author', tags: ['b', 'c'] })
  assert.equal(result.id, target.id)
  assert.equal(store.books.value.length, 2)
  assert.equal(store.getBookById(source.id), undefined)
  assert.deepEqual(result.quoteIds, ['q1', 'q2'])
  assert.equal(result.highlightCount, 2)
  assert.deepEqual(result.tags, ['a', 'b', 'c'])
  assert.equal(result.isFavorite, true)
  assert.equal(result.stars, 4)
  assert.equal(result.cover, 'target.jpg')
  assert.deepEqual(quotes.quotes[1], { id: 'q2', bookId: target.id, text: 'Keep', color: 'pink', isFavorite: true, tags: ['tag'], bookTitle: 'Title', author: 'Author' })
  assert.equal(quotes.quotes[2].bookId, other.id)
  assert.deepEqual(result.noteIds, ['n1', 'n2'])
  assert.ok(notes.notes.every(note => note.bookId === target.id && note.bookTitle === 'Title'))
})

test('different author or case does not merge; normal edits still work', () => {
  const { store } = setup()
  store.addBook({ title: 'Title', author: 'Author' })
  const book = store.addBook({ title: 'Old', author: 'Other' })
  assert.equal(store.updateBook(book.id, { title: 'Title' }).id, book.id)
  assert.equal(store.updateBook(book.id, { title: 'title', author: 'Author' }).id, book.id)
  assert.equal(store.books.value.length, 2)
  assert.equal(store.updateBook('missing', { title: 'Title' }), null)
})

test('ratings do not trigger merging and empty authors can match', () => {
  const { store } = setup()
  const first = store.addBook({ title: 'Title', author: '' })
  const second = store.addBook({ title: 'Title', author: '' })
  store.updateBook(second.id, { stars: 5 })
  assert.equal(store.books.value.length, 2)
  const result = store.updateBook(second.id, { title: 'Title', author: '' })
  assert.equal(result.id, first.id)
  assert.equal(result.stars, 5)
  assert.equal(store.books.value.length, 1)
})

test('title-only notes are not reassigned when their ownership is ambiguous', () => {
  const { store, notes } = setup()
  const source = store.addBook({ title: 'Shared', author: 'A' })
  store.addBook({ title: 'Shared', author: 'B' })
  const target = store.addBook({ title: 'Target', author: 'C' })
  notes.notes.push({ id: 'n', bookTitle: 'Shared' }, { id: 'owned', bookId: source.id, bookTitle: 'Shared' })
  store.updateBook(source.id, { title: 'Target', author: 'C' })
  assert.equal(notes.notes[0].bookTitle, 'Shared')
  assert.equal(notes.notes[1].bookId, target.id)
})
