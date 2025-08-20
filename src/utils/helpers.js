// Utility functions for generating unique IDs and other helpers

export function generateId(prefix = '') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

export function generateBookId() {
  return generateId('book')
}

export function generateQuoteId() {
  return generateId('quote')
}

export function generateNoteId() {
  return generateId('note')
}

// Format date helpers
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Color utilities for quotes
export const QUOTE_COLORS = [
  'yellow',
  'blue', 
  'green',
  'pink',
  'purple',
  'orange',
  'red',
  'gray'
]

export function getRandomQuoteColor() {
  return QUOTE_COLORS[Math.floor(Math.random() * QUOTE_COLORS.length)]
}

// Text utilities
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function sanitizeText(text) {
  return text.replace(/[^\w\s-]/gi, '').trim()
}

// Book title utilities
export function formatBookTitleForUrl(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function createBookKey(title, author) {
  return `${sanitizeText(title)}|${sanitizeText(author)}`
}
