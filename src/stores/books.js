import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateBookId } from '../utils/helpers.js'
import { StorageService } from '../services/StorageService.js'

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
      books.value[index] = {
        ...books.value[index],
        ...updates,
        lastModified: new Date().toISOString()
      }
      return books.value[index]
    }
    return null
  }

  function deleteBook(bookId) {
    const index = books.value.findIndex(book => book.id === bookId)
    if (index !== -1) {
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
