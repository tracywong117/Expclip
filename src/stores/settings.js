import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { StorageService } from '../services/StorageService.js'

export const useSettingsStore = defineStore('settings', () => {
  // State - Initialize from localStorage
  const settings = ref(StorageService.loadSettings())

  // Actions
  function updateSetting(key, value) {
    settings.value[key] = value
  }

  function resetToDefaults() {
    settings.value = {
      theme: 'light',
      autoBackup: false,
      notifications: true
    }
  }

  function clearAllData() {
    // This will clear all app data from localStorage
    return StorageService.clearAll()
  }

  // Auto-save to localStorage whenever settings change
  watch(settings, (newSettings) => {
    StorageService.saveSettings(newSettings)
  }, { deep: true })

  return {
    // State
    settings,
    
    // Actions
    updateSetting,
    resetToDefaults,
    clearAllData
  }
})
