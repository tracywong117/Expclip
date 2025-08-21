// Storage utility for browser localStorage persistence
export class StorageService {
  static STORAGE_KEYS = {
    BOOKS: 'expclip_books',
    QUOTES: 'expclip_quotes',
    SETTINGS: 'expclip_settings'
  }

  // Save data to localStorage
  static save(key, data) {
    try {
      const jsonString = JSON.stringify(data)
      localStorage.setItem(key, jsonString)
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  // Load data from localStorage
  static load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return defaultValue
    }
  }

  // Remove data from localStorage
  static remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }

  // Clear all app data from localStorage
  static clearAll() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // Save books to localStorage
  static saveBooks(books) {
    return this.save(this.STORAGE_KEYS.BOOKS, books)
  }

  // Load books from localStorage
  static loadBooks() {
    return this.load(this.STORAGE_KEYS.BOOKS, [])
  }

  // Save quotes to localStorage
  static saveQuotes(quotes) {
    return this.save(this.STORAGE_KEYS.QUOTES, quotes)
  }

  // Load quotes from localStorage
  static loadQuotes() {
    return this.load(this.STORAGE_KEYS.QUOTES, [])
  }

  // Save settings to localStorage
  static saveSettings(settings) {
    return this.save(this.STORAGE_KEYS.SETTINGS, settings)
  }

  // Load settings from localStorage
  static loadSettings() {
    return this.load(this.STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      autoBackup: false,
      notifications: true
    })
  }

  // Get storage usage info
  static getStorageInfo() {
    try {
      const used = new Blob(Object.values(localStorage)).size
      const available = 5 * 1024 * 1024 // Approximate 5MB limit
      return {
        used,
        available,
        percentage: Math.round((used / available) * 100)
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}
