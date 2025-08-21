<template>
  <Dialog :show="show" @update:show="$emit('update:show', $event)">
    <div class="w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Backup & Restore</h2>
        <button 
          @click="$emit('update:show', false)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Backup Section -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Create Backup</h3>
          </div>
          <p class="text-gray-600 mb-4">
            Export all your data to a JSON file. 
            This backup can be used to restore your data later.
          </p>
          
          <div class="flex items-center space-x-2">
            <button
              @click="createBackup"
              :disabled="creatingBackup"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg v-if="!creatingBackup" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ creatingBackup ? 'Creating...' : 'Create Backup' }}
            </button>
          </div>

          <div v-if="backupMessage" class="p-3 rounded-md" :class="backupSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
            <div class="flex">
              <svg v-if="backupSuccess" class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{{ backupMessage }}</span>
            </div>
          </div>
        </div>

        <!-- Restore Section -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Restore from Backup</h3>
          </div>
          <p class="text-gray-600 mb-4">
            Select a backup file to restore your data. 
            <strong class="text-orange-600">Warning:</strong> This will replace all current data.
          </p>

          <div class="space-y-2">
            <div>
              <input
                type="file"
                accept=".json"
                @change="handleFileSelect"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div v-if="restorePreview" class="bg-gray-50 p-4 rounded-md">
              <!-- <h4 class="text-sm font-medium text-gray-900 mb-2">Backup Preview:</h4> -->
              <div class="text-sm text-gray-600 space-y-1">
                <div>Created: {{ formatDate(restorePreview.timestamp) }}</div>
                <div>Books: {{ restorePreview.books?.length || 0 }}</div>
                <div>Quotes: {{ restorePreview.quotes?.length || 0 }}</div>
                <!-- <div>Version: {{ restorePreview.version || 'Unknown' }}</div> -->
              </div>
            </div>

            <div class="flex space-x-3">
              <button
                @click="confirmRestore"
                :disabled="!selectedFile || !isValidBackup || restoring"
                class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="!restoring" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ restoring ? 'Restoring...' : 'Restore Data' }}
              </button>
              <button
                @click="clearSelection"
                :disabled="!selectedFile"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Selection
              </button>
            </div>

            <div v-if="restoreMessage" class="p-3 rounded-md" :class="restoreSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
              <div class="flex">
                <svg v-if="restoreSuccess" class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ restoreMessage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Tips -->
        <!-- <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Tips</h3>
          </div>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <span class="text-yellow-600 mr-2">•</span>
              Backup your files regularly to prevent data loss
            </li>
            <li class="flex items-start">
              <span class="text-yellow-600 mr-2">•</span>
              Backup files are in JSON format and can be opened in any text editor
            </li>
          </ul>
        </div> -->
      </div>

    </div>

    <!-- Restore Confirmation Dialog -->
    <Dialog :show="showRestoreConfirm" @update:show="showRestoreConfirm = $event">
      <div class="w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Restore</h3>
        
        <p class="text-gray-600 mb-4">
          Are you sure you want to restore from this backup? 
          This will permanently replace all your current data.
        </p>
        
        <div v-if="restorePreview" class="bg-orange-50 p-4 rounded-md mb-6">
          <h4 class="text-sm font-medium text-orange-800 mb-2">This will restore:</h4>
          <div class="text-sm text-orange-700">
            <div>• {{ restorePreview.books?.length || 0 }} books</div>
            <div>• {{ restorePreview.quotes?.length || 0 }} quotes</div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showRestoreConfirm = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="performRestore"
            :disabled="restoring"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ restoring ? 'Restoring...' : 'Restore' }}
          </button>
        </div>
      </div>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBooksStore } from '../stores/books'
import { useQuotesStore } from '../stores/quotes'
import BackupService from '../services/BackupService'
import Dialog from './Dialog.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const booksStore = useBooksStore()
const quotesStore = useQuotesStore()

// Backup state
const creatingBackup = ref(false)
const backupMessage = ref('')
const backupSuccess = ref(false)

// Restore state
const selectedFile = ref(null)
const restorePreview = ref(null)
const isValidBackup = ref(false)
const restoring = ref(false)
const restoreMessage = ref('')
const restoreSuccess = ref(false)
const showRestoreConfirm = ref(false)

// Computed
const backupStats = computed(() => ({
  books: booksStore.bookCount,
  quotes: quotesStore.quoteCount
}))

// Methods
async function createBackup() {
  creatingBackup.value = true
  backupMessage.value = ''
  
  try {
    const success = await BackupService.exportBackup()
    
    if (success) {
      backupMessage.value = 'Backup created and downloaded successfully!'
      backupSuccess.value = true
    } else {
      backupMessage.value = 'Failed to create backup. Please try again.'
      backupSuccess.value = false
    }
  } catch (error) {
    console.error('Backup error:', error)
    backupMessage.value = 'Error creating backup: ' + error.message
    backupSuccess.value = false
  } finally {
    creatingBackup.value = false
    
    // Clear message after 5 seconds
    setTimeout(() => {
      backupMessage.value = ''
    }, 5000)
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  selectedFile.value = file
  validateFile()
}

async function validateFile() {
  if (!selectedFile.value) {
    restorePreview.value = null
    isValidBackup.value = false
    return
  }

  try {
    const fileContent = await readFileAsText(selectedFile.value)
    const backupData = JSON.parse(fileContent)
    
    const validation = BackupService.validateBackup(backupData)
    
    if (validation.valid) {
      restorePreview.value = backupData
      isValidBackup.value = true
      restoreMessage.value = ''
    } else {
      isValidBackup.value = false
      restoreMessage.value = `Invalid backup file: ${validation.errors.join(', ')}`
      restoreSuccess.value = false
    }
  } catch (error) {
    console.error('File validation error:', error)
    isValidBackup.value = false
    restoreMessage.value = 'Error reading backup file. Please select a valid JSON backup file.'
    restoreSuccess.value = false
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function confirmRestore() {
  if (!isValidBackup.value || !selectedFile.value) return
  showRestoreConfirm.value = true
}

async function performRestore() {
  if (!isValidBackup.value || !selectedFile.value) return

  restoring.value = true
  restoreMessage.value = ''
  showRestoreConfirm.value = false

  try {
    const fileContent = await readFileAsText(selectedFile.value)
    const backupData = JSON.parse(fileContent)
    
    const success = await BackupService.restoreFromBackup(backupData)
    
    if (success) {
      restoreMessage.value = 'Data restored successfully!'
      restoreSuccess.value = true
      clearSelection()
    } else {
      restoreMessage.value = 'Failed to restore data. Please try again.'
      restoreSuccess.value = false
    }
  } catch (error) {
    console.error('Restore error:', error)
    restoreMessage.value = 'Error restoring data: ' + error.message
    restoreSuccess.value = false
  } finally {
    restoring.value = false
    
    // Clear message after 5 seconds
    setTimeout(() => {
      restoreMessage.value = ''
    }, 5000)
  }
}

function clearSelection() {
  selectedFile.value = null
  restorePreview.value = null
  isValidBackup.value = false
  restoreMessage.value = ''
  
  // Clear file input
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.value = ''
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  // Clear any previous state when dialog opens
  if (props.show) {
    backupMessage.value = ''
    restoreMessage.value = ''
    clearSelection()
  }
})
</script>
