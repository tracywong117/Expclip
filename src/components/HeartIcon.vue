<template>
    <div class="mr-2 cursor-pointer" @click="$emit('toggle')">
      <svg xmlns="http://www.w3.org/2000/svg" 
           class="h-5 w-5 transition-colors"
           :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
           viewBox="0 0 20 20" 
           :fill="isFavorite ? 'currentColor' : 'none'"
           stroke="currentColor"
           stroke-width="2">
        <path d="M3.172 5.172a4.004 4.004 0 015.656 0L10 6.343l1.172-1.171a4.004 4.004 0 115.656 5.656L10 17.657l-6.828-6.829a4.004 4.004 0 010-5.656z" />
      </svg>
    </div>
</template>

<script setup>
// Props
defineProps({
    isFavorite: {
        type: Boolean,
        default: false
    }
})

// Emits
defineEmits(['toggle'])
</script>