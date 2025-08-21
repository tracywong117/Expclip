<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Add New Quote</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <form @submit.prevent="saveQuote" class="space-y-4">
        <!-- Book Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Book *</label>
          <select 
            v-model="quoteForm.bookId" 
            required
            class="w-full p-3 border rounded">
            <option value="">Choose a book...</option>
            <option v-for="book in books" :key="book.id" :value="book.id">
              {{ book.title }} by {{ book.author }}
            </option>
          </select>
        </div>
        
        <!-- Quote Text -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quote Text *</label>
          <textarea 
            v-model="quoteForm.text" 
            required
            rows="4"
            class="w-full p-3 border rounded resize-vertical" 
            placeholder="Enter the quote text here..."></textarea>
        </div>
        
        <!-- Page Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Page Number</label>
          <input 
            v-model.number="quoteForm.page" 
            type="number"
            min="1"
            class="w-full p-3 border rounded" 
            placeholder="Page number (optional)">
        </div>
        
        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location/Chapter</label>
          <input 
            v-model="quoteForm.location" 
            class="w-full p-3 border rounded" 
            placeholder="e.g., Chapter 5, Section 2.1 (optional)">
        </div>
        
        <!-- Tags -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input 
            v-model="tagsInput" 
            class="w-full p-3 border rounded" 
            placeholder="Inspirational, Philosophy, Key Insight">
        </div> -->
        
        <!-- Personal Notes -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Personal Notes</label>
          <textarea 
            v-model="quoteForm.notes" 
            rows="3"
            class="w-full p-3 border rounded resize-vertical" 
            placeholder="Your thoughts, reflections, or notes about this quote..."></textarea>
        </div> -->
        
        <!-- Favorite -->
        <div class="flex items-center">
          <input 
            v-model="quoteForm.isFavorite" 
            type="checkbox"
            id="isFavorite"
            class="mr-2">
          <label for="isFavorite" class="text-sm font-medium text-gray-700">
            Mark as favorite
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 pt-4">
          <button 
            type="button"
            @click="closeDialog"
            class="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
          <button 
            type="submit"
            class="bg-violet-500 text-white hover:bg-violet-600 px-4 py-2 rounded">
            Add Quote
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBooksStore } from '@/stores/books'
import { useQuotesStore } from '@/stores/quotes'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  preselectedBookId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'quote-added'])

// Stores
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()

// Computed
const books = computed(() => booksStore.books)

// Reactive data
const quoteForm = ref({
  bookId: '',
  text: '',
  page: null,
  location: '',
  notes: '',
  isFavorite: false
})

const tagsInput = ref('')

// Methods
const closeDialog = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  quoteForm.value = {
    bookId: props.preselectedBookId || '',
    text: '',
    page: null,
    location: '',
    notes: '',
    isFavorite: false
  }
  tagsInput.value = ''
}

const saveQuote = () => {
  // Process tags
  const tags = tagsInput.value 
    ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    : []
  
  // Create the quote
  const newQuote = {
    bookId: quoteForm.value.bookId,
    text: quoteForm.value.text,
    page: quoteForm.value.page || null,
    location: quoteForm.value.location || '',
    notes: quoteForm.value.notes || '',
    tags: tags,
    isFavorite: quoteForm.value.isFavorite
  }
  
  const createdQuote = quotesStore.addQuote(newQuote)
  
  emit('quote-added', createdQuote)
  closeDialog()
}

// Reset form when dialog opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Watch for preselected book changes
watch(() => props.preselectedBookId, (newBookId) => {
  if (newBookId) {
    quoteForm.value.bookId = newBookId
  }
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

textarea {
  resize: vertical;
}
</style>
