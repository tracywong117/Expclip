<template>
    <div class="inline-flex bg-gray-100 rounded-full p-0.5 shadow-sm">
      <button 
        @click="$emit('view-change', 'list')" 
        :class="[
          'flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out text-sm',
          currentView === 'list' 
            ? 'bg-[#f0fdf4] shadow-sm' 
            : 'text-gray-500 hover:bg-gray-200'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
        <span v-if="currentView === 'list'" class="ml-1.5 font-medium">List</span>
      </button>
      <button 
        @click="$emit('view-change', 'grid')" 
        :class="[
          'flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out text-sm',
          currentView === 'grid' 
            ? 'bg-[#f0fdf4] shadow-sm' 
            : 'text-gray-500 hover:bg-gray-200'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span v-if="currentView === 'grid'" class="ml-1.5 font-medium">Grid</span>
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentView: {
        type: String,
        required: true,
        validator: (value) => ['list', 'grid'].includes(value)
      }
    },
    emits: ['view-change']
  }
  </script>