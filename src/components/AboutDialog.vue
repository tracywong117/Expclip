<template>
  <Dialog :show="isOpen" @update:show="handleDialogClose">
    <div class="max-w-lg flex flex-col items-center">
      <div class=""><img src="/icons/logo.svg" class="h-32" alt="Expclip Logo" /></div>
      
      <!-- Description -->
      <div class="text-gray-700 mb-6">
        <p class="mb-4">
            <strong>Expclip</strong> is a modern, elegant browser-based application for managing your Kindle highlights and book quotes.
            All data stays safely in your browser — no server or cloud required. You should also <strong>back up</strong> such that you can recover your data at any time.
            Organize, search, and export your reading insights with ease.
        </p>
    
      </div>
      
      <!-- Features -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Key Features</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start">
            <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
            Import Kindle highlights from My Clippings.txt
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
            Organize books and quotes in a clean, intuitive interface
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
            Search and filter your highlights easily  
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
            Export your collection in various formats
          </li>
        </ul>
      </div>
      
      <!-- Version Info -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6 w-[75%]">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium">Version</span>
          <span class="text-gray-600">1.0.0</span>
        </div>
        <div class="flex justify-between items-center text-sm mt-2">
          <span class="font-medium">Built with</span>
          <span class="text-gray-600">Vue 3, Tailwind CSS</span>
        </div>
        <div class="flex justify-between items-center text-sm mt-2">
          <span class="font-medium">License</span>
          <span class="text-gray-600">MIT</span>
        </div>
      </div>
      
      <!-- Links -->
      <div class="flex justify-center space-x-4 mb-6">
        <a href="https://github.com/tracywong117/Expclip" class="text-blue-500 hover:text-blue-700 text-sm flex items-center" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github mr-1"></i>
            GitHub
        </a>
        <!-- <a href="#" class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
          <i class="fas fa-book mr-1"></i>
          Documentation
        </a> -->
        <a href="mailto:tracywong117@gmail.com" class="text-blue-500 hover:text-blue-700 text-sm flex items-center">
          <i class="fas fa-envelope mr-1"></i>
          Email Developer
        </a>
      </div>
      
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from '@/components/Dialog.vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Methods
const closeDialog = () => {
  emit('close')
}

const handleDialogClose = (show) => {
  if (!show) {
    closeDialog()
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
</style>
