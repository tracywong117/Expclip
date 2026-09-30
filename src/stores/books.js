import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateBookId } from '../utils/helpers.js'
import { StorageService } from '../services/StorageService.js'
import { useQuotesStore } from './quotes.js'
import { useNotesStore } from './notes.js'

export const useBooksStore = defineStore('books', () => {
  // State - Initialize from localStorage
  const books = ref(StorageService.loadBooks())
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const bookCount = computed(() => books.value.length)
  const favoriteBooks = computed(() => books.value.filter(book => book.isFavorite))
  const recentBooks = computed(() => {
    return books.value
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5)
  })

  // Actions
  function addBook(book) {
    const newBook = {
      id: generateBookId(),
      title: book.title,
      author: book.author || 'Unknown Author',
      quoteIds: [], // Store quote IDs instead of quote objects
      noteIds: [], // Store note IDs instead of note objects
      highlightCount: 0,
      isFavorite: false,
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: book.tags || [],
      stars: book.stars || 0,
      image: book.image || '',
      cover: book.cover || '',
      ...book
    }
    books.value.push(newBook)
    return newBook
  }

  function updateBook(bookId, updates) {
    const index = books.value.findIndex(book => book.id === bookId)
    if (index !== -1) {
      const source = books.value[index]
      const edited = { ...source, ...updates }
      const target = ('title' in updates || 'author' in updates) && books.value.find(book =>
        book.id !== bookId && book.title === edited.title && book.author === edited.author)
      if (target) return mergeBook(source, edited, target)
      books.value[index] = {
        ...books.value[index],
        ...updates,
        lastModified: new Date().toISOString()
      }
      return books.value[index]
    }
    return null
  }

  function mergeBook(source, edited, target) {
    const quotesStore = useQuotesStore()
    const notesStore = useNotesStore()
    const movedQuotes = quotesStore.quotes.filter(quote => quote.bookId === source.id)
    const movedIds = new Set(movedQuotes.map(quote => quote.id))
    const sourceNoteIds = new Set(source.noteIds || [])
    // Legacy notes only carry a title. Move them by title only if unambiguous.
    const uniqueTitle = books.value.filter(book => book.title === source.title).length === 1
    const movedNotes = notesStore.notes.filter(note => note.bookId === source.id ||
      movedIds.has(note.quoteId) || sourceNoteIds.has(note.id) ||
      (!note.bookId && !note.quoteId && uniqueTitle && note.bookTitle === source.title))
    for (const quote of movedQuotes) {
      quotesStore.updateQuote(quote.id, { bookId: target.id, bookTitle: target.title, author: target.author })
    }
    for (const note of movedNotes) {
      notesStore.updateNote(note.id, { bookId: target.id, bookTitle: target.title })
    }
    const quoteIds = quotesStore.quotes.filter(quote => quote.bookId === target.id).map(quote => quote.id)
    const merged = {
      ...target,
      quoteIds,
      highlightCount: quoteIds.length,
      noteIds: [...new Set([...(target.noteIds || []), ...(source.noteIds || []), ...movedNotes.map(note => note.id)])],
      tags: [...new Set([...(target.tags || []), ...(edited.tags || [])])],
      isFavorite: !!(target.isFavorite || edited.isFavorite),
      stars: Math.max(target.stars || 0, edited.stars || 0),
      cover: target.cover || edited.cover || '',
      image: target.image || edited.image || '',
      lastModified: new Date().toISOString(),
    }
    books.value = books.value.filter(book => book.id !== source.id)
      .map(book => book.id === target.id ? merged : book)
    return merged
  }

  function deleteBook(bookId) {
    const index = books.value.findIndex(book => book.id === bookId)
    if (index !== -1) {
      const book = books.value[index]
      const quotesStore = useQuotesStore()
      const notesStore = useNotesStore()
      // The quote's bookId is authoritative, even if cached quoteIds are stale.
      const quoteIds = new Set(quotesStore.quotes.filter(quote => quote.bookId === bookId).map(quote => quote.id))
      const noteIds = new Set(book.noteIds || [])
      const uniqueTitle = books.value.filter(item => item.title === book.title).length === 1
      const relatedNotes = notesStore.notes.filter(note => note.bookId === bookId || quoteIds.has(note.quoteId) ||
        (!note.bookId && !note.quoteId && (noteIds.has(note.id) || (uniqueTitle && note.bookTitle === book.title))))
      for (const note of relatedNotes) notesStore.deleteNote(note.id)
      for (const quoteId of quoteIds) quotesStore.deleteQuote(quoteId)
      books.value.splice(index, 1)
      return true
    }
    return false
  }

  function getBookById(bookId) {
    return books.value.find(book => book.id === bookId)
  }

  function getBookByTitle(title) {
    return books.value.find(book => book.title === title)
  }

  function toggleFavorite(bookId) {
    const book = getBookById(bookId)
    if (book) {
      book.isFavorite = !book.isFavorite
      book.lastModified = new Date().toISOString()
    }
  }

  function searchBooks(query) {
    const searchTerm = query.toLowerCase()
    return books.value.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    )
  }

  function clearBooks() {
    books.value = []
  }

  function setLoading(state) {
    loading.value = state
  }

  function setError(errorMessage) {
    error.value = errorMessage
  }

  function clearError() {
    error.value = null
  }

  function addQuoteToBook(bookId, quoteId) {
    const book = getBookById(bookId)
    if (book && !book.quoteIds.includes(quoteId)) {
      book.quoteIds.push(quoteId)
      book.highlightCount = book.quoteIds.length
      book.lastModified = new Date().toISOString()
    }
  }

  function removeQuoteFromBook(bookId, quoteId) {
    const book = getBookById(bookId)
    if (book) {
      book.quoteIds = book.quoteIds.filter(id => id !== quoteId)
      book.highlightCount = book.quoteIds.length
      book.lastModified = new Date().toISOString()
    }
  }

  function getBookQuotes(bookId) {
    // This will be used with the quotes store to get actual quote objects
    const book = getBookById(bookId)
    return book ? book.quoteIds : []
  }

  // Backup/Restore methods
  function clearAllBooks() {
    books.value = []
  }

  function restoreBook(bookData) {
    // Restore a book from backup data
    const restoredBook = {
      ...bookData,
      // Ensure required fields exist
      id: bookData.id || generateBookId(),
      quoteIds: bookData.quoteIds || [],
      noteIds: bookData.noteIds || [],
      highlightCount: bookData.highlightCount || 0,
      isFavorite: bookData.isFavorite || false,
      dateAdded: bookData.dateAdded || new Date().toISOString(),
      lastModified: bookData.lastModified || new Date().toISOString(),
      tags: bookData.tags || [],
      stars: bookData.stars || 0
    }
    books.value.push(restoredBook)
    return restoredBook
  }

  // Auto-save to localStorage whenever books change
  watch(books, (newBooks) => {
    StorageService.saveBooks(newBooks)
  }, { deep: true })

  return {
    // State
    books,
    loading,
    error,
    
    // Getters
    bookCount,
    favoriteBooks,
    recentBooks,
    
    // Actions
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    getBookByTitle,
    toggleFavorite,
    searchBooks,
    clearBooks,
    setLoading,
    setError,
    clearError,
    addQuoteToBook,
    removeQuoteFromBook,
    getBookQuotes,
    clearAllBooks,
    restoreBook
  }
})
