<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Add New Book</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <form @submit.prevent="saveBook" class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input 
            v-model="bookForm.title" 
            required
            class="w-full p-3 border rounded text-lg font-semibold" 
            placeholder="Book Title">
        </div>
        
        <!-- Author -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Author *</label>
          <input 
            v-model="bookForm.author" 
            required
            class="w-full p-3 border rounded" 
            placeholder="Author Name">
        </div>
        
        <!-- Cover URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input 
            v-model="bookForm.cover" 
            class="w-full p-3 border rounded" 
            placeholder="https://example.com/cover.jpg">
        </div>
        
        <!-- Rating -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div class="flex items-center">
            <span v-for="star in 5" :key="star" 
                  @click="bookForm.stars = star"
                  class="text-amber-300 cursor-pointer text-xl hover:text-amber-400">
              <i v-if="star <= bookForm.stars" class="fas fa-star mr-1"></i>
              <i v-else class="far fa-star mr-1"></i>
            </span>
            <span class="ml-2 text-gray-500">({{ bookForm.stars }}/5)</span>
          </div>
        </div>
        
        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input 
            v-model="tagsInput" 
            class="w-full p-3 border rounded" 
            placeholder="Fiction, Classic, Romance">
        </div>
        
        <!-- Additional Information -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
          <div v-for="(field, index) in additionalFields" :key="index" 
               class="flex gap-2 items-center mb-2">
            <input 
              v-model="field.key" 
              placeholder="Field name (e.g., Genre, Year, Publisher)" 
              class="flex-1 p-2 border rounded">
            <input 
              v-model="field.value" 
              placeholder="Value" 
              class="flex-1 p-2 border rounded">
            <button 
              type="button"
              @click="removeField(index)" 
              class="text-red-500 hover:text-red-700 px-2">
              ✕
            </button>
          </div>
          
          <button 
            type="button"
            @click="addField"
            class="bg-white text-blue-500 border border-blue-300 px-3 py-1 rounded hover:bg-blue-100 text-sm">
            Add Field
          </button>
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
            Add Book
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBooksStore } from '@/stores/books'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'book-added'])

// Store
const booksStore = useBooksStore()

// Reactive data
const bookForm = ref({
  title: '',
  author: '',
  cover: '',
  stars: 0
})

const tagsInput = ref('')
const additionalFields = ref([{ key: '', value: '' }])

// Methods
const closeDialog = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  bookForm.value = {
    title: '',
    author: '',
    cover: '',
    stars: 0
  }
  tagsInput.value = ''
  additionalFields.value = [{ key: '', value: '' }]
}

const addField = () => {
  additionalFields.value.push({ key: '', value: '' })
}

const removeField = (index) => {
  additionalFields.value.splice(index, 1)
  
  // Ensure at least one field exists
  if (additionalFields.value.length === 0) {
    additionalFields.value.push({ key: '', value: '' })
  }
}

const saveBook = () => {
  // Process tags
  const tags = tagsInput.value 
    ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    : []
  
  // Process additional info
  const additionalInfo = {}
  additionalFields.value.forEach(field => {
    if (field.key.trim() && field.value.trim()) {
      additionalInfo[field.key.trim()] = field.value.trim()
    }
  })
  
  // Create the book
  const newBook = {
    title: bookForm.value.title,
    author: bookForm.value.author,
    cover: bookForm.value.cover,
    stars: bookForm.value.stars,
    tags: tags,
    additionalInfo: additionalInfo
  }
  
  const createdBook = booksStore.addBook(newBook)
  
  emit('book-added', createdBook)
  closeDialog()
}

// Reset form when dialog opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>
