import { computed } from 'vue'

const defaults = { query:'', selectedTag:'', selectedRating:'all', view:'grid', bookOrder:'title-asc' }
const valid = {
  query: value => typeof value === 'string',
  selectedTag: value => typeof value === 'string',
  selectedRating: value => ['all','0','1','2','3','4','5','6'].includes(value),
  view: value => ['grid','list'].includes(value),
  bookOrder: value => ['title-asc','title-desc','date-asc','date-desc'].includes(value),
}

// Keep the state in the persistent settings store, not the route component.
export function libraryPreferences(settingsStore) {
  return Object.fromEntries(Object.keys(defaults).map(key => [key,computed({
    get: () => {
      const value = settingsStore.settings.libraryPreferences?.[key]
      return valid[key](value) ? value : defaults[key]
    },
    set: value => {
      if (!valid[key](value)) return
      settingsStore.updateSetting('libraryPreferences', {
        ...settingsStore.settings.libraryPreferences,
        [key]: value,
      })
    },
  })]))
}
