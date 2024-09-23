<template>
    <div class="bg-white rounded-lg border p-4 flex items-center space-x-4 mb-4 hover:bg-gray-50 cursor-pointer">
      <img :src="book.image" alt="Book Cover" class="w-20 h-20 rounded-lg" />
      <div class="flex-1">
        <h3 class="text-lg font-semibold mb-1">{{ book.title }}</h3>
        <p class="text-sm text-gray-500 mb-4">by {{ book.author }}</p>
        <div class="flex items-center">
          <span class="flex items-center mr-2">
            <span v-for="star in 5" :key="star" class="text-amber-300">
              <i v-if="star <= book.stars" class="fas fa-star mr-1"></i>
              <i v-else class="far fa-star mr-1"></i>
            </span>
          </span>
        </div>
      </div>
      <div>
        <i class="fas fa-chevron-right text-gray-400"></i>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      book: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  </style>