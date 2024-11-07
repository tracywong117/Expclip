<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">All Tags</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div v-for="tag in tags" :key="tag" class="bg-gray-200 text-gray-700 px-3 py-2 rounded">
          {{ tag }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        tags: [
          'Classic',
          'Novel',
          'Drama',
          'Dystopian',
          'Science Fiction',
          'Romance',
          'Coming-of-Age',
          'Adventure',
          'Historical',
          'Epic',
          'Psychological',
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  </style>