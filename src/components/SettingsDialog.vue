<template>
  <Dialog :show="show" @update:show="$emit('update:show', $event)">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Settings</h2>
        <button 
          @click="$emit('update:show', false)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <!-- General Settings -->
        <!-- <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">General</h3>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Theme</label>
                <p class="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <select 
                v-model="localSettings.theme"
                @change="updateSetting('theme', localSettings.theme)"
                class="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Auto Backup</label>
                <p class="text-sm text-gray-500">Automatically backup data weekly</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="localSettings.autoBackup"
                  @change="updateSetting('autoBackup', localSettings.autoBackup)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Notifications</label>
                <p class="text-sm text-gray-500">Show app notifications</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="localSettings.notifications"
                  @change="updateSetting('notifications', localSettings.notifications)"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div> -->

        <!-- Storage Info -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Storage</h3>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Data Usage</span>
                <span class="text-sm text-gray-500">{{ storageInfo.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: storageInfo.percentage + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Using {{ formatBytes(storageInfo.used) }} of ~{{ formatBytes(storageInfo.available) }}
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-md">
                <div class="text-2xl font-bold text-blue-600">{{ booksStore.bookCount }}</div>
                <div class="text-sm text-blue-600">Books</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-md">
                <div class="text-2xl font-bold text-green-600">{{ quotesStore.quoteCount }}</div>
                <div class="text-sm text-green-600">Quotes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="border border-orange-200 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Data Management</h3>
          </div>

          <div class="space-y-4">
            <div class="bg-orange-50 p-4 rounded-md">
              <h4 class="text-sm font-medium text-orange-800 mb-2">Clear All Data</h4>
              <p class="text-sm text-orange-700 mb-3">
                This will permanently delete all your books, quotes, and settings. This action cannot be undone.
              </p>
              <button
                @click="confirmClearData"
                class="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>

           
          </div>
        </div>
      </div>

      
    </div>

    <!-- Clear Data Confirmation Dialog -->
    <Dialog :show="showClearConfirm" @update:show="showClearConfirm = $event">
      <div class="w-full">
        <div class="flex items-center mb-4">
          <svg class="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Clear All Data</h3>
        </div>
        
        <p class="text-gray-600 mb-4">
          Are you absolutely sure you want to delete all your data? This will permanently remove:
        </p>
        
        <div class="bg-red-50 p-4 rounded-md mb-6">
          <ul class="text-sm text-red-700 space-y-1">
            <li>• {{ booksStore.bookCount }} books</li>
            <li>• {{ quotesStore.quoteCount }} quotes</li>
            <!-- <li>• All settings and preferences</li> -->
          </ul>
          <p class="text-sm font-medium text-red-800 mt-2">This action cannot be undone!</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showClearConfirm = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="performClearData"
            :disabled="clearing"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ clearing ? 'Clearing...' : 'Delete Everything' }}
          </button>
        </div>
      </div>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useBooksStore } from '../stores/books'
import { useQuotesStore } from '../stores/quotes'
import { StorageService } from '../services/StorageService'
import Dialog from './Dialog.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const settingsStore = useSettingsStore()
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()

// Local reactive copy of settings for form binding
const localSettings = reactive({ ...settingsStore.settings })
const storageInfo = ref({ used: 0, available: 0, percentage: 0 })
const showClearConfirm = ref(false)
const clearing = ref(false)

// Methods
function updateSetting(key, value) {
  settingsStore.updateSetting(key, value)
  localSettings[key] = value
}

function resetSettings() {
  settingsStore.resetToDefaults()
  Object.assign(localSettings, settingsStore.settings)
}

function confirmClearData() {
  showClearConfirm.value = true
}

async function performClearData() {
  clearing.value = true
  
  try {
    // Clear stores first
    booksStore.clearAllBooks()
    quotesStore.clearAllQuotes()
    
    // Clear localStorage
    const success = settingsStore.clearAllData()
    
    if (success) {
      // Reset settings store
      settingsStore.resetToDefaults()
      Object.assign(localSettings, settingsStore.settings)
      
      showClearConfirm.value = false
      emit('update:show', false)
      
      // Show success message (you could add a toast notification here)
      console.log('All data cleared successfully')
    } else {
      console.error('Failed to clear data')
    }
  } catch (error) {
    console.error('Error clearing data:', error)
  } finally {
    clearing.value = false
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function updateStorageInfo() {
  storageInfo.value = StorageService.getStorageInfo()
}

onMounted(() => {
  updateStorageInfo()
  
  // Update storage info when dialog opens
  if (props.show) {
    updateStorageInfo()
  }
})
</script>
