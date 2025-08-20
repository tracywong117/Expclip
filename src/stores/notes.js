import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  // State
  const notes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const noteCount = computed(() => notes.value.length)
  const recentNotes = computed(() => {
    return notes.value
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 10)
  })
  
  const notesByBook = computed(() => {
    const grouped = {}
    notes.value.forEach(note => {
      if (!grouped[note.bookTitle]) {
        grouped[note.bookTitle] = []
      }
      grouped[note.bookTitle].push(note)
    })
    return grouped
  })

  // Actions
  function addNote(note) {
    const newNote = {
      id: Date.now().toString(),
      title: note.title || 'Untitled Note',
      content: note.content,
      bookTitle: note.bookTitle || null,
      quoteId: note.quoteId || null, // Link to a specific quote
      tags: note.tags || [],
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...note
    }
    notes.value.push(newNote)
    return newNote
  }

  function updateNote(noteId, updates) {
    const index = notes.value.findIndex(note => note.id === noteId)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updates,
        lastModified: new Date().toISOString()
      }
      return notes.value[index]
    }
    return null
  }

  function deleteNote(noteId) {
    const index = notes.value.findIndex(note => note.id === noteId)
    if (index !== -1) {
      notes.value.splice(index, 1)
      return true
    }
    return false
  }

  function getNoteById(noteId) {
    return notes.value.find(note => note.id === noteId)
  }

  function getNotesByBook(bookTitle) {
    return notes.value.filter(note => note.bookTitle === bookTitle)
  }

  function getNotesByQuote(quoteId) {
    return notes.value.filter(note => note.quoteId === quoteId)
  }

  function addTag(noteId, tag) {
    const note = getNoteById(noteId)
    if (note && !note.tags.includes(tag)) {
      note.tags.push(tag)
      note.lastModified = new Date().toISOString()
    }
  }

  function removeTag(noteId, tag) {
    const note = getNoteById(noteId)
    if (note) {
      note.tags = note.tags.filter(t => t !== tag)
      note.lastModified = new Date().toISOString()
    }
  }

  function searchNotes(query) {
    const searchTerm = query.toLowerCase()
    return notes.value.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      (note.bookTitle && note.bookTitle.toLowerCase().includes(searchTerm)) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  function getNotesByTag(tag) {
    return notes.value.filter(note => note.tags.includes(tag))
  }

  function getAllTags() {
    const tags = new Set()
    notes.value.forEach(note => {
      note.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  function clearNotes() {
    notes.value = []
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

  return {
    // State
    notes,
    loading,
    error,
    
    // Getters
    noteCount,
    recentNotes,
    notesByBook,
    
    // Actions
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByBook,
    getNotesByQuote,
    addTag,
    removeTag,
    searchNotes,
    getNotesByTag,
    getAllTags,
    clearNotes,
    setLoading,
    setError,
    clearError
  }
})
