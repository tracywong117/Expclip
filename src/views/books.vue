<template>
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex flex-row items-center gap-5">
          <div class="text-2xl font-bold text-customPurple-600">All Books</div>
        </div>
  
        <div class="flex items-center space-x-4">
          <ListGridToggle :current-view="viewMode" @view-change="handleViewModeChange" />
        </div>
      </div>
      <div class="flex mb-4">
        <TagSelector :tags="tags" @update:selectedTags="handleSelectedTags" />
      </div>
  
      <div class="flex justify-center">
        <div :class="viewMode" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:px-5" v-if="viewMode === 'grid'">
          <div
            v-for="book in paginatedBooks"
            :key="book.id"
            class="rounded-lg p-4 w-fit flex flex-col items-center justify-center cursor-pointer"
            @click="goToBookInstance(book.title)"
          >
            <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="w-48 h-48 object-cover rounded-lg" />
            <div v-if="!book.cover" class="w-48 h-48 border flex justify-center items-center cursor-pointer"></div>
            <h3 class="text-lg font-semibold my-1">{{ book.title }}</h3>
            <p class="text-sm text-gray-500 mb-4">by {{ book.author }}</p>
            <span class="flex items-center">
              <span v-for="star in 5" :key="star" class="text-amber-300">
                <i v-if="star <= book.stars" class="fas fa-star mr-1"></i>
                <i v-else class="far fa-star mr-1"></i>
              </span>
            </span>
          </div>
        </div>
      </div>
  
      <div :class="viewMode" class="grid gap-6" v-if="viewMode === 'list'">
        <div
          v-for="book in paginatedBooks"
          :key="book.id"
          class="rounded-lg p-4 w-full cursor-pointer flex justify-between items-center"
          @click="goToBookInstance(book.title)"
        >
          <div class="flex">
            <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="w-48 h-48 object-cover rounded-lg" />
            <div v-if="!book.cover" class="w-48 h-48 border flex justify-center items-center cursor-pointer"></div>
            <div class="ml-4 flex block">
              <div class="flex flex-col justify-between">
                <div>
                  <h3 class="text-lg font-semibold mb-1">{{ book.title }}</h3>
                  <p class="text-sm text-gray-500 mb-4">by {{ book.author }}</p>
                  <span v-for="n in 5" :key="n" class="text-yellow-400">
                    <i class="fas" :class="n <= book.stars ? 'fa-star' : 'fa-star-o'"></i>
                  </span>
                </div>
                <div class="flex items-center">
                  <p class="text-sm">
                    <span v-for="tag in book.tags" :key="tag" class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2">{{ tag }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>
  
      <div class="flex justify-center mt-6">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="['px-3 py-1 mx-1 rounded', { 'bg-customPurple-600 text-white': currentPage === page, 'bg-gray-200': currentPage !== page }]"
        >
          {{ page }}
        </button>
        <div>
          <button
            @click="currentPage = currentPage + 1"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 mx-1 rounded bg-customPurple-600 text-white"
            :class="{ 'bg-gray-200': currentPage === totalPages }"
          >
            Next
          </button>
          <input type="number" v-model.number="booksPerPage" min="3" max="99" class="m-auto bg-white border border-gray-300 rounded px-2 py-1 w-20 outline-none" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ListGridToggle from '@/components/ListGridToggle.vue';
  import TagSelector from '@/components/TagSelector.vue';
  
  export default {
    components: {
      ListGridToggle,
      TagSelector,
    },
    data() {
      return {
        books: [
          { id: 1, cover: '', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', tags: ['Classic', 'Novel'], stars: 4 },
          { id: 2, cover: '', title: 'To Kill a Mockingbird', author: 'Harper Lee', tags: ['Classic', 'Drama'], stars: 5 },
          { id: 3, cover: '', title: '1984', author: 'George Orwell', tags: ['Dystopian', 'Science Fiction'], stars: 4 },
          { id: 4, cover: '', title: 'Pride and Prejudice', author: 'Jane Austen', tags: ['Romance', 'Classic'], stars: 5 },
          { id: 5, cover: '', title: 'The Catcher in the Rye', author: 'J.D. Salinger', tags: ['Classic', 'Coming-of-Age'], stars: 3 },
          { id: 6, cover: '', title: 'Moby-Dick', author: 'Herman Melville', tags: ['Adventure', 'Classic'], stars: 4 },
          { id: 7, cover: '', title: 'War and Peace', author: 'Leo Tolstoy', tags: ['Historical', 'Classic'], stars: 5 },
          { id: 8, cover: '', title: 'The Odyssey', author: 'Homer', tags: ['Epic', 'Classic'], stars: 4 },
          { id: 9, cover: '', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', tags: ['Classic', 'Psychological'], stars: 5 },
          { id: 10, cover: '', title: 'Brave New World', author: 'Aldous Huxley', tags: ['Dystopian', 'Science Fiction'], stars: 4 },
        ],
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
        ],
        selectedTags: [],
        currentPage: 1,
        booksPerPage: 8,
        viewMode: 'grid', // 'list' or 'grid'
      };
    },
    computed: {
      paginatedBooks() {
        const start = (this.currentPage - 1) * this.booksPerPage;
        const end = start + this.booksPerPage;
        return this.books.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.books.length / this.booksPerPage);
      },
    },
    methods: {
      handleViewModeChange(newView) {
        this.viewMode = newView;
      },
      handleSelectedTags(tags) {
        this.selectedTags = tags;
      },
      goToBookInstance(title) {
        const formattedTitle = title.replace(/\s+/g, '-');
        this.$router.push(`/books/${formattedTitle}`);
      },
    },
  };
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
  .list {
    grid-template-columns: 1fr;
  }
  </style>