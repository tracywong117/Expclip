import { useBooksStore } from '@/stores/books'
import { useQuotesStore } from '@/stores/quotes'

export default class BackupService {
  static generateBackup() {
    const booksStore = useBooksStore()
    const quotesStore = useQuotesStore()
    
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      books: booksStore.books,
      quotes: quotesStore.quotes,
      settings: {
        exportedFrom: 'Expclip',
        totalBooks: booksStore.books.length,
        totalQuotes: quotesStore.quotes.length
      }
    }
    
    return backupData
  }
  
  static async exportBackup() {
    try {
      const backupData = this.generateBackup()
      const jsonString = JSON.stringify(backupData, null, 2)
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `expclip-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Export backup error:', error)
      return false
    }
  }
  
  static async restoreFromBackup(backupData) {
    try {
      // Validate backup structure
      const validation = this.validateBackup(backupData)
      if (!validation.valid) {
        throw new Error('Invalid backup file format: ' + validation.errors.join(', '))
      }
      
      const booksStore = useBooksStore()
      const quotesStore = useQuotesStore()
      
      // Clear existing data
      booksStore.clearAllBooks()
      quotesStore.clearAllQuotes()
      
      let booksRestored = 0
      let quotesRestored = 0
      
      // Restore books
      if (backupData.books && Array.isArray(backupData.books)) {
        backupData.books.forEach(book => {
          if (booksStore.restoreBook(book)) {
            booksRestored++
          }
        })
      }
      
      // Restore quotes
      if (backupData.quotes && Array.isArray(backupData.quotes)) {
        backupData.quotes.forEach(quote => {
          if (quotesStore.restoreQuote(quote)) {
            quotesRestored++
          }
        })
      }
      
      return true
      
    } catch (error) {
      console.error('Backup restore error:', error)
      return false
    }
  }
  
  static validateBackup(backupData) {
    const errors = []
    
    // Basic validation
    if (!backupData || typeof backupData !== 'object') {
      errors.push('Invalid backup data structure')
      return { valid: false, errors }
    }
    
    if (!backupData.version) {
      errors.push('Missing version information')
    }
    
    if (!backupData.books && !backupData.quotes) {
      errors.push('No books or quotes data found')
    }
    
    if (backupData.books && !Array.isArray(backupData.books)) {
      errors.push('Books data must be an array')
    }
    
    if (backupData.quotes && !Array.isArray(backupData.quotes)) {
      errors.push('Quotes data must be an array')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
