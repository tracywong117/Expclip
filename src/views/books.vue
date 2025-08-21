<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <div class="flex flex-row items-center gap-5">
        <div class="text-3xl font-bold">All Books</div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- <button 
          @click="showAddBookDialog = true"
          class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <i class="fas fa-plus"></i>
          Add
        </button> -->
        <ListGridToggle :current-view="viewMode" @view-change="handleViewModeChange" />
      </div>
    </div>
    <div class="flex mb-4 space-x-4">
      <button @click="showAddBookDialog = true"
        class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded flex items-center gap-2">
        <i class="fas fa-plus"></i>
        Add
      </button>
      <TagSelector :tags="tags" @update:selectedTags="handleSelectedTags" />
    </div>

    <div class="flex justify-center">
      <div :class="viewMode" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:px-5"
        v-if="viewMode === 'grid'">
        <div v-for="book in paginatedBooks" :key="book.id"
          class="rounded-lg p-4 w-fit flex flex-col items-center justify-center cursor-pointer"
          @click="goToBookInstance(book.id)">
          <div v-if="book.cover" class="w-48 flex justify-center">
            <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="h-48 rounded-lg" />
          </div>
          <div v-if="!book.cover" class="w-48 h-48 border cursor-pointer"></div>
          <h3 class="text-lg font-semibold my-1 text-center">{{ book.title }}</h3>
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
      <div v-for="book in paginatedBooks" :key="book.id"
        class="rounded-lg p-4 w-full cursor-pointer flex justify-between items-center"
        @click="goToBookInstance(book.id)">
        <div class="flex">
          <!-- <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="h-48 rounded-lg" /> -->
          <div v-if="book.cover || book.image" class="w-48 h-48">
            <img :src="book.cover || book.image" alt="Book Cover" class="h-48 rounded-lg" />
          </div>
          <div v-if="!book.cover" class="w-48 h-48 border flex justify-center items-center cursor-pointer"></div>
          <div class="ml-4 flex">
            <div class="flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-1">{{ book.title }}</h3>
                <p class="text-sm text-gray-500 mb-4">by {{ book.author }}</p>
                <span v-for="n in 5" :key="n" class="text-yellow-400">
                  <i class="fas" :class="n <= book.stars ? 'fa-star' : 'fa-star-o'"></i>
                </span>
              </div>
              <!-- Tags Display -->
              <div v-if="book.tags && book.tags.length > 0" class="flex flex-wrap gap-2">
                <span v-for="tag in book.tags" :key="tag"
                  class="inline-block bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full">
                  {{ tag }}
                </span>
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
      <button v-for="page in totalPages" :key="page" @click="currentPage = page"
        :class="['px-3 py-1 mx-1 rounded', { 'bg-customPurple-600 text-white': currentPage === page, 'bg-gray-200': currentPage !== page }]">
        {{ page }}
      </button>
      <div>
        <button @click="currentPage = currentPage + 1" :disabled="currentPage === totalPages"
          class="px-3 py-1 mx-1 rounded bg-customPurple-600 text-white"
          :class="{ 'bg-gray-200': currentPage === totalPages }">
          Next
        </button>
        <input type="number" v-model.number="booksPerPage" min="3" max="99"
          class="m-auto bg-white border border-gray-300 rounded px-2 py-1 w-20 outline-none" />
      </div>
    </div>

    <!-- Add Book Dialog -->
    <AddBookDialog :is-open="showAddBookDialog" @close="showAddBookDialog = false" @book-added="handleBookAdded" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores'
import { useQuotesStore } from '@/stores'
import ListGridToggle from '@/components/ListGridToggle.vue'
import TagSelector from '@/components/TagSelector.vue'
import AddBookDialog from '@/components/AddBookDialog.vue'

// Initialize store and router
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()
const router = useRouter()

// Reactive data
const selectedTags = ref([])
const currentPage = ref(1)
const booksPerPage = ref(8)
const viewMode = ref('grid') // 'list' or 'grid'
const showAddBookDialog = ref(false)

// Computed properties
const books = computed(() => {
  let filteredBooks = booksStore.books

  // Filter by selected tags if any
  if (selectedTags.value.length > 0) {
    filteredBooks = filteredBooks.filter(book =>
      book.tags && book.tags.some(tag => selectedTags.value.includes(tag))
    )
  }

  return filteredBooks
})

const tags = computed(() => {
  // Get all unique tags from all books
  const allTags = new Set()
  booksStore.books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags).sort()
})

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * booksPerPage.value
  const end = start + booksPerPage.value
  return books.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(books.value.length / booksPerPage.value)
})

// Methods
const handleViewModeChange = (newView) => {
  viewMode.value = newView
}

const handleSelectedTags = (tags) => {
  selectedTags.value = tags
  currentPage.value = 1 // Reset to first page when filtering
}

const goToBookInstance = (bookId) => {
  router.push(`/books/${bookId}`)
}

const handleBookAdded = (newBook) => {
  // Navigate to the new book's page
  router.push(`/books/${newBook.id}`)
}

</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.list {
  grid-template-columns: 1fr;
}
</style>