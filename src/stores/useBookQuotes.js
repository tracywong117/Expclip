// Composable for managing book-quote relationships
import { computed } from 'vue'
import { useBooksStore, useQuotesStore } from '@/stores'

export function useBookQuotes() {
  const booksStore = useBooksStore()
  const quotesStore = useQuotesStore()

  // Get all quotes for a specific book
  const getQuotesForBook = (bookId) => {
    const book = booksStore.getBookById(bookId)
    if (!book) return []
    
    return book.quoteIds.map(quoteId => 
      quotesStore.getQuoteById(quoteId)
    ).filter(Boolean) // Remove any null/undefined quotes
  }

  // Get book information for a quote
  const getBookForQuote = (quoteId) => {
    const quote = quotesStore.getQuoteById(quoteId)
    if (!quote || !quote.bookId) return null
    
    return booksStore.getBookById(quote.bookId)
  }

  // Create a book with quotes (for import functionality)
  const createBookWithQuotes = (bookData, quotesData) => {
    // Create the book first
    const book = booksStore.addBook(bookData)
    
    // Create quotes and link them to the book
    const createdQuotes = []
    quotesData.forEach(quoteData => {
      const quote = quotesStore.addQuote({
        ...quoteData,
        bookId: book.id,
        bookTitle: book.title,
        author: book.author
      })
      
      booksStore.addQuoteToBook(book.id, quote.id)
      createdQuotes.push(quote)
    })
    
    return { book, quotes: createdQuotes }
  }

  // Delete a quote and update book relationship
  const deleteQuoteWithBookUpdate = (quoteId) => {
    const quote = quotesStore.getQuoteById(quoteId)
    if (quote && quote.bookId) {
      booksStore.removeQuoteFromBook(quote.bookId, quoteId)
    }
    return quotesStore.deleteQuote(quoteId)
  }

  // Get books with their quote counts
  const getBooksWithQuoteCounts = computed(() => {
    return booksStore.books.map(book => ({
      ...book,
      quoteCount: book.quoteIds.length,
      quotes: getQuotesForBook(book.id)
    }))
  })

  // Get quote statistics by book
  const getQuoteStatsByBook = computed(() => {
    const stats = {}
    booksStore.books.forEach(book => {
      const quotes = getQuotesForBook(book.id)
      stats[book.id] = {
        total: quotes.length,
        favorites: quotes.filter(q => q.isFavorite).length,
        byColor: quotes.reduce((acc, q) => {
          acc[q.color] = (acc[q.color] || 0) + 1
          return acc
        }, {}),
        recent: quotes
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
          .slice(0, 5)
      }
    })
    return stats
  })

  return {
    getQuotesForBook,
    getBookForQuote,
    createBookWithQuotes,
    deleteQuoteWithBookUpdate,
    getBooksWithQuoteCounts,
    getQuoteStatsByBook
  }
}
