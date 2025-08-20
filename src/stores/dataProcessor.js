import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBooksStore } from './books.js'
import { useQuotesStore } from './quotes.js'
import { dataProcessor } from '../utils/dataProcessor.js'
import { useBookQuotes } from './useBookQuotes.js'

export const useDataProcessorStore = defineStore('dataProcessor', () => {
  // State
  const isProcessing = ref(false)
  const processedCount = ref(0)
  const totalCount = ref(0)
  const errors = ref([])

  // Get other stores and composables
  const booksStore = useBooksStore()
  const quotesStore = useQuotesStore()
  const { createBookWithQuotes } = useBookQuotes()

  // Actions
  function parseKindleClippings(fileContent) {
    isProcessing.value = true
    errors.value = []
    
    try {
      // Use the existing dataProcessor utility
      const records = dataProcessor.processClippingsFile(fileContent)
      totalCount.value = records.length
      processedCount.value = 0

      const parsedData = {
        booksMap: new Map(), // Use Map for better performance
        quotesToAdd: []
      }

      records.forEach((record, index) => {
        try {
          const bookTitle = record.Book
          const author = record.Author

          // Create or get book
          let book
          const bookKey = `${bookTitle}|${author}` // Unique key for book
          
          if (!parsedData.booksMap.has(bookKey)) {
            // Check if book already exists in store
            const existingBook = booksStore.getBookByTitle(bookTitle)
            if (existingBook && existingBook.author === author) {
              book = existingBook
            } else {
              // Create new book
              book = booksStore.addBook({
                title: bookTitle,
                author: author,
                tags: [],
                stars: 0
              })
            }
            parsedData.booksMap.set(bookKey, book)
          } else {
            book = parsedData.booksMap.get(bookKey)
          }

          // Create quote with proper relationships
          const quote = {
            text: record.Quote,
            bookTitle: bookTitle,
            bookId: book.id, // Link to book ID
            author: author,
            location: record.Location,
            page: record.Page,
            dateHighlighted: parseDateTime(record.Week, record.Datetime),
            type: 'highlight',
            color: 'yellow' // Default color, each quote gets its own
          }

          const newQuote = quotesStore.addQuote(quote)
          
          // Add quote ID to book
          booksStore.addQuoteToBook(book.id, newQuote.id)
          
          parsedData.quotesToAdd.push(newQuote)
          
          processedCount.value++
        } catch (error) {
          errors.value.push({
            index,
            error: error.message,
            content: record.Quote?.substring(0, 100) + '...' || 'No content'
          })
        }
      })

      return {
        booksProcessed: parsedData.booksMap.size,
        quotesProcessed: parsedData.quotesToAdd.length,
        errors: errors.value
      }

    } catch (error) {
      errors.value.push({
        general: true,
        error: error.message
      })
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  function parseDateTime(week, datetime) {
    try {
      // Try to parse the date string
      const dateStr = `${week}, ${datetime}`
      const date = new Date(dateStr)
      return date.toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  function exportToKindleFormat() {
    const quotes = quotesStore.quotes
    const booksStore = useBooksStore()
    
    // Convert quotes back to the format expected by existing utility
    const records = quotes.map((quote, index) => {
      const book = booksStore.getBookById(quote.bookId)
      return {
        index,
        Book: book?.title || 'Unknown Book',
        Author: book?.author || 'Unknown Author',
        Page: quote.page || '',
        Location: quote.location || '',
        Week: new Date(quote.dateHighlighted).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        Datetime: new Date(quote.dateHighlighted).toLocaleTimeString('en-US'),
        Quote: quote.text
      }
    })

    return dataProcessor.generateExportContent(records)
  }

  function resetProgress() {
    processedCount.value = 0
    totalCount.value = 0
    errors.value = []
  }

  return {
    // State
    isProcessing,
    processedCount,
    totalCount,
    errors,
    
    // Actions
    parseKindleClippings,
    exportToKindleFormat,
    resetProgress
  }
})
