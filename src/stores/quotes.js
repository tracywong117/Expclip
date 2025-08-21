import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateQuoteId } from '../utils/helpers.js'
import { StorageService } from '../services/StorageService.js'

export const useQuotesStore = defineStore('quotes', () => {
  // State - Initialize from localStorage
  const quotes = ref(StorageService.loadQuotes())
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const quoteCount = computed(() => quotes.value.length)
  const favoriteQuotes = computed(() => quotes.value.filter(quote => quote.isFavorite))
  const recentQuotes = computed(() => {
    return quotes.value
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 10)
  })
  
  const quotesByBook = computed(() => {
    const grouped = {}
    quotes.value.forEach(quote => {
      if (!grouped[quote.bookId]) {
        grouped[quote.bookId] = []
      }
      grouped[quote.bookId].push(quote)
    })
    return grouped
  })

  // Actions
  function addQuote(quote) {
    const newQuote = {
      id: generateQuoteId(),
      text: quote.text,
      bookId: quote.bookId, // Only store book ID reference
      location: quote.location || null,
      page: quote.page || null,
      chapter: quote.chapter || null,
      isFavorite: false,
      tags: quote.tags || [],
      color: quote.color || 'yellow', // Individual color for each quote
      dateAdded: new Date().toISOString(),
      dateHighlighted: quote.dateHighlighted || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...quote
    }
    quotes.value.push(newQuote)
    return newQuote
  }

  function updateQuote(quoteId, updates) {
    const index = quotes.value.findIndex(quote => quote.id === quoteId)
    if (index !== -1) {
      quotes.value[index] = {
        ...quotes.value[index],
        ...updates,
        lastModified: new Date().toISOString()
      }
      return quotes.value[index]
    }
    return null
  }

  function deleteQuote(quoteId) {
    const index = quotes.value.findIndex(quote => quote.id === quoteId)
    if (index !== -1) {
      quotes.value.splice(index, 1)
      return true
    }
    return false
  }

  function getQuoteById(quoteId) {
    return quotes.value.find(quote => quote.id === quoteId)
  }

  function getQuotesByBook(bookId) {
    return quotes.value.filter(quote => quote.bookId === bookId)
  }

  function toggleFavorite(quoteId) {
    const quote = getQuoteById(quoteId)
    if (quote) {
      quote.isFavorite = !quote.isFavorite
      quote.lastModified = new Date().toISOString()
    }
  }

  function addTag(quoteId, tag) {
    const quote = getQuoteById(quoteId)
    if (quote && !quote.tags.includes(tag)) {
      quote.tags.push(tag)
      quote.lastModified = new Date().toISOString()
    }
  }

  function removeTag(quoteId, tag) {
    const quote = getQuoteById(quoteId)
    if (quote) {
      quote.tags = quote.tags.filter(t => t !== tag)
      quote.lastModified = new Date().toISOString()
    }
  }

  function searchQuotes(query) {
    const searchTerm = query.toLowerCase()
    return quotes.value.filter(quote => 
      quote.text.toLowerCase().includes(searchTerm) ||
      quote.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  function getQuotesByTag(tag) {
    return quotes.value.filter(quote => quote.tags.includes(tag))
  }

  function getAllTags() {
    const tags = new Set()
    quotes.value.forEach(quote => {
      quote.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  function clearQuotes() {
    quotes.value = []
  }

  // Backup and restore functions
  function clearAllQuotes() {
    quotes.value = []
  }

  function restoreQuote(quoteData) {
    if (!quoteData || !quoteData.id) {
      console.error('Invalid quote data for restore:', quoteData)
      return false
    }

    try {
      const quote = {
        id: quoteData.id,
        text: quoteData.text || '',
        bookId: quoteData.bookId || null,
        bookTitle: quoteData.bookTitle || '',
        author: quoteData.author || '',
        page: quoteData.page || null,
        location: quoteData.location || null,
        chapter: quoteData.chapter || '',
        note: quoteData.note || '',
        tags: Array.isArray(quoteData.tags) ? quoteData.tags : [],
        isFavorite: Boolean(quoteData.isFavorite),
        createdAt: quoteData.createdAt || new Date().toISOString(),
        updatedAt: quoteData.updatedAt || new Date().toISOString()
      }

      quotes.value.push(quote)
      return true
    } catch (error) {
      console.error('Error restoring quote:', error)
      return false
    }
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

  // Auto-save to localStorage whenever quotes change
  watch(quotes, (newQuotes) => {
    StorageService.saveQuotes(newQuotes)
  }, { deep: true })

  return {
    // State
    quotes,
    loading,
    error,
    
    // Getters
    quoteCount,
    favoriteQuotes,
    recentQuotes,
    quotesByBook,
    
    // Actions
    addQuote,
    updateQuote,
    deleteQuote,
    getQuoteById,
    getQuotesByBook,
    toggleFavorite,
    addTag,
    removeTag,
    searchQuotes,
    getQuotesByTag,
    getAllTags,
    clearQuotes,
    clearAllQuotes,
    restoreQuote,
    setLoading,
    setError,
    clearError
  }
})
