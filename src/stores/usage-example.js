// Example of how to use the Pinia stores in your Vue components

// In a component's <script setup>:

import { 
  useBooksStore, 
  useQuotesStore, 
  useNotesStore, 
  useDataProcessorStore 
} from '@/stores'

// Initialize stores
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()
const notesStore = useNotesStore()
const dataProcessor = useDataProcessorStore()

// Example: Handle file upload and process Kindle clippings
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const content = await file.text()
    const result = dataProcessor.parseKindleClippings(content)
    
    console.log(`Processed ${result.booksProcessed} books and ${result.quotesProcessed} quotes`)
    
    if (result.errors.length > 0) {
      console.warn('Some errors occurred during processing:', result.errors)
    }
  } catch (error) {
    console.error('Failed to process file:', error)
  }
}

// Example: Working with books
const addNewBook = () => {
  const newBook = booksStore.addBook({
    title: 'My New Book',
    author: 'Author Name'
  })
  console.log('Added book:', newBook)
}

const searchBooks = (query) => {
  return booksStore.searchBooks(query)
}

// Example: Working with quotes
const addNewQuote = () => {
  const newQuote = quotesStore.addQuote({
    text: 'This is a great quote!',
    bookTitle: 'My New Book',
    author: 'Author Name',
    tags: ['inspiration', 'wisdom']
  })
  console.log('Added quote:', newQuote)
}

const searchQuotes = (query) => {
  return quotesStore.searchQuotes(query)
}

// Example: Working with notes
const addNote = (quoteId) => {
  const note = notesStore.addNote({
    title: 'My thoughts on this quote',
    content: 'This quote reminds me of...',
    quoteId: quoteId,
    tags: ['personal', 'reflection']
  })
  console.log('Added note:', note)
}

// Example: Reactive data for templates
const books = computed(() => booksStore.books)
const quotes = computed(() => quotesStore.quotes)
const favoriteQuotes = computed(() => quotesStore.favoriteQuotes)
const bookCount = computed(() => booksStore.bookCount)
const quoteCount = computed(() => quotesStore.quoteCount)

// Example: Export functionality
const exportData = () => {
  const kindleFormat = dataProcessor.exportToKindleFormat()
  
  // Create and download file
  const blob = new Blob([kindleFormat], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'My Clippings.txt'
  a.click()
  URL.revokeObjectURL(url)
}

/* 
In your template, you can use the reactive data like this:

<template>
  <div>
    <h2>My Library</h2>
    <p>Books: {{ bookCount }} | Quotes: {{ quoteCount }}</p>
    
    <div v-for="book in books" :key="book.id">
      <h3>{{ book.title }} by {{ book.author }}</h3>
      <p>{{ book.highlights.length }} highlights</p>
    </div>
    
    <div v-for="quote in favoriteQuotes" :key="quote.id">
      <blockquote>{{ quote.text }}</blockquote>
      <p>- {{ quote.bookTitle }}</p>
    </div>
    
    <input type="file" @change="handleFileUpload" accept=".txt" />
    <button @click="exportData">Export All</button>
  </div>
</template>
*/
