<template>
  <Dialog :show="isOpen" @update:show="handleDialogClose">
    <div class="">
      <div class="text-xl font-semibold mb-3">Import Highlights from Kindle</div>
      <div class="text-md text-gray-500 mb-3">
        Kindle Clippings is the file that contains all the highlights and notes you've made on your Kindle device. You can import this file to get all your highlights and notes in one place.
      </div>
      <label class="border-dashed border-2 border-gray-300 p-10 text-center cursor-pointer hover:border-gray-400 transition block w-[70%] mx-auto">
        <div class="flex flex-col items-center">
          <img src="/icons/file-text.svg" class="w-10 h-10 mb-2" alt="File icon" />
          <p v-if="!fileName" class="text-lg">
            Drop <em class="text-purple-600">My Clipping.txt</em> here
          </p>
          <p v-else class="text-lg">
            Selected file: <em class="text-purple-600">{{ fileName }}</em>
          </p>
        </div>
        <input type="file" class="hidden" accept=".txt" @change="handleFileUpload" />
      </label>

      <!-- Progress bar -->
      <div v-if="uploadProgress > 0" class="mt-5 w-[50%] mx-auto">
        <div class="bg-gray-200 rounded-full h-2.5">
          <div class="bg-lime-500 h-2.5 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="text-center mt-2 text-sm text-gray-500">{{ uploadProgress }}% uploaded</p>
      </div>

      <!-- Upload and Cancel buttons -->
      <div class="flex justify-center mt-5 space-x-4">
        <button 
          v-if="!isUploading" 
          @click="uploadFile" 
          :disabled="!selectedFile"
          class="bg-green-200 text-green-800 hover:bg-green-400 hover:text-green-900 px-10 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Upload
        </button>
        <button 
          v-if="isUploading" 
          @click="cancelUpload" 
          class="bg-red-200 text-red-800 hover:bg-red-400 hover:text-red-900 px-10 py-2 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useDataProcessorStore } from '@/stores'
import Dialog from '@/components/Dialog.vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'import-success', 'import-error'])

// Store
const dataProcessor = useDataProcessorStore()

// Reactive data
const fileName = ref('')
const uploadProgress = ref(0)
const isUploading = ref(false)
const uploadInterval = ref(null)
const selectedFile = ref(null)

// Methods
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    fileName.value = file.name
    selectedFile.value = file
  } else {
    fileName.value = ''
    selectedFile.value = null
  }
}

const uploadFile = async () => {
  if (isUploading.value || !selectedFile.value) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Simulate upload progress
    uploadInterval.value = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 5
      }
    }, 100)

    // Read and process the file
    const content = await selectedFile.value.text()
    const result = await dataProcessor.parseKindleClippings(content)
    
    // Complete the progress
    uploadProgress.value = 100
    
    // Show success message and emit success event
    setTimeout(() => {
      const message = `Successfully imported ${result.quotesProcessed} quotes from ${result.booksProcessed} books!`
      alert(message)
      
      emit('import-success', {
        result,
        message
      })
      
      closeDialog()
      
      if (result.errors.length > 0) {
        console.warn('Some errors occurred during import:', result.errors)
      }
    }, 500)
    
  } catch (error) {
    console.error('Error processing file:', error)
    const errorMessage = 'Error processing file. Please make sure it\'s a valid Kindle clippings file.'
    alert(errorMessage)
    
    emit('import-error', {
      error,
      message: errorMessage
    })
  } finally {
    clearInterval(uploadInterval.value)
    isUploading.value = false
  }
}

const cancelUpload = () => {
  clearInterval(uploadInterval.value)
  uploadProgress.value = 0
  isUploading.value = false
}

const closeDialog = () => {
  resetForm()
  emit('close')
}

const handleDialogClose = (show) => {
  if (!show) {
    closeDialog()
  }
}

const resetForm = () => {
  fileName.value = ''
  selectedFile.value = null
  uploadProgress.value = 0
  isUploading.value = false
  if (uploadInterval.value) {
    clearInterval(uploadInterval.value)
    uploadInterval.value = null
  }
}

// Reset form when dialog opens/closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (uploadInterval.value) {
    clearInterval(uploadInterval.value)
  }
})
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
