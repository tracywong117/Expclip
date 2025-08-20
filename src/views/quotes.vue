<template>
    <div class="flex">
        <!-- Mobile menu button -->
        <!-- <button 
    class="mobile-menu-btn fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md border"
    @click="toggleSidebar"
    aria-label="Toggle filters menu"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  </button> -->

        <!-- Mobile overlay -->
        <div v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" @click="closeSidebar"></div>

        <!-- Sidebar with Filters -->
        <div class="sidebar-container w-[300px] bg-white shadow-md flex flex-col h-screen fixed left-[250px] top-0 z-40 md:left-[250px] transform transition-transform duration-300 ease-in-out"
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
            <div class="p-4 border-b">
                <!-- Mobile close button -->
                <div class="flex justify-between items-center mb-2 md:block">
                    <h2 class="text-xl font-semibold">Filters</h2>
                    <button class="md:hidden p-1 rounded hover:bg-gray-100" @click="closeSidebar"
                        aria-label="Close filters menu">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <!-- Favourite Filter -->
                <div class="flex items-center mb-2">
                    <input id="fav-filter" type="checkbox" v-model="favouriteOnly" class="mr-2" />
                    <label for="fav-filter" class="text-sm cursor-pointer">Favourite</label>
                </div>
                <!-- Color Filter -->
                <div class="flex items-center gap-2 mb-2">
                    <span v-for="color in colorOptions" :key="color" :title="color" :class="['rounded-full h-5 w-5 cursor-pointer border-2',
                        selectedColor === color ? 'border-black' : 'border-transparent',
                        `bg-${color}-300`
                    ]" @click="toggleColorFilter(color)"></span>
                    <span class="ml-2 text-xs text-gray-500">Color</span>
                </div>
            </div>
            <!-- Collapsible Books Section -->
            <div>
                <div class="flex items-center justify-between px-4 py-2 cursor-pointer select-none border-b"
                    @click="minBooks = !minBooks">
                    <span class="font-bold">Books</span>
                    <span>{{ minBooks ? '+' : '-' }}</span>
                </div>
                <div v-show="!minBooks" class="px-4 py-2 border-b">
                    <input type="text" v-model="bookSearch" placeholder="Search Books"
                        class="mb-2 w-full px-2 py-1 border rounded text-sm" />
                    <div class="h-40 overflow-y-auto">
                        <ul>
                            <li v-for="book in filteredBooks" :key="book" @click="filterByBook(book)"
                                class="cursor-pointer hover:bg-gray-200 p-2 rounded text-sm"
                                :class="{ 'bg-blue-200': selectedBook === book }">
                                {{ book }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- Collapsible Authors Section -->
            <div>
                <div class="flex items-center justify-between px-4 py-2 cursor-pointer select-none border-b"
                    @click="minAuthors = !minAuthors">
                    <span class="font-bold">Authors</span>
                    <span>{{ minAuthors ? '+' : '-' }}</span>
                </div>
                <div v-show="!minAuthors" class="px-4 py-2">
                    <input type="text" v-model="authorSearch" placeholder="Search Authors"
                        class="mb-2 w-full px-2 py-1 border rounded text-sm" />
                    <div class="h-40 overflow-y-auto">
                        <ul>
                            <li v-for="author in filteredAuthors" :key="author" @click="filterByAuthor(author)"
                                class="cursor-pointer hover:bg-gray-200 p-2 rounded text-sm"
                                :class="{ 'bg-blue-200': selectedAuthor === author }">
                                {{ author }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t mt-auto h-[70px]">
                <button @click="clearFilters" class="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
                    Clear Filters
                </button>
            </div>
        </div>
        <!-- Main Content -->
        <div class="main-content w-full min-h-screen ml-[325px] mr-[25px] md:ml-[325px] transition-all duration-300"
            :class="{ 'ml-0 mr-4': true }">
            <div class="">
                <div class="text-3xl font-bold my-6">Book Quotes</div>
                
                <div class="flex justify-between items-center mb-4">
                    <button
                        class="mobile-menu-btn md:hidden bg-white p-2 rounded-lg border"
                        @click="toggleSidebar" aria-label="Toggle filters menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
    
                    <div class="flex items-center space-x-4">
                        <select v-model="sortOrder" @change="sortQuotes" class="border rounded px-2 py-1">
                            <option value="asc">Sort: Oldest First</option>
                            <option value="desc">Sort: Newest First</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-6">
                    <div v-for="quote in paginatedQuotes" :key="quote.id">
                        <quote-content :quote="quote" @deleteQuote="handleDelete" @updateQuote="handleEdit" />
                    </div>
                </div>
                <div class="mt-6 flex justify-center">
                    <button @click="loadMore" v-if="hasMoreQuotes"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Load More
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiExportVariant } from '@mdi/js'
import { useQuotesStore, useDataProcessorStore, useBooksStore } from '@/stores'
import FileSaver from "file-saver"
import Popover from '@/components/Popover.vue'
import QuoteContent from '@/components/QuoteContent.vue'

// Initialize stores
const quotesStore = useQuotesStore()
const dataProcessor = useDataProcessorStore()
const booksStore = useBooksStore()

// Reactive data
const file = ref(null)
const content = ref(null)
const selectedBook = ref(null)
const selectedAuthor = ref(null)
const sortOrder = ref('desc')
const pageSize = ref(20)
const currentPage = ref(1)
const docRef = ref(null)
const minBooks = ref(false)
const minAuthors = ref(false)
const bookSearch = ref("")
const authorSearch = ref("")
const favouriteOnly = ref(false)
const colorOptions = ["yellow", "red", "pink", "blue", "green", "orange", "gray", "purple"]
const selectedColor = ref(null)
const sidebarOpen = ref(false)

// Computed properties
const uniqueBooks = computed(() => {
    const bookIds = [...new Set(quotesStore.quotes.map(quote => quote.bookId))]
    const bookTitles = bookIds.map(bookId => {
        const book = booksStore.getBookById(bookId)
        return book ? book.title : null
    }).filter(title => title !== null)
    return [...new Set(bookTitles)]
})

const uniqueAuthors = computed(() => {
    const bookIds = [...new Set(quotesStore.quotes.map(quote => quote.bookId))]
    const authors = bookIds.map(bookId => {
        const book = booksStore.getBookById(bookId)
        return book ? book.author : null
    }).filter(author => author !== null)
    return [...new Set(authors)]
})

const filteredBooks = computed(() => {
    if (!bookSearch.value) return uniqueBooks.value
    return uniqueBooks.value.filter(b => b.toLowerCase().includes(bookSearch.value.toLowerCase()))
})

const filteredAuthors = computed(() => {
    if (!authorSearch.value) return uniqueAuthors.value
    return uniqueAuthors.value.filter(a => a.toLowerCase().includes(authorSearch.value.toLowerCase()))
})

const filteredQuotes = computed(() => {
    let filtered = quotesStore.quotes
    if (selectedBook.value) {
        filtered = filtered.filter(quote => {
            const book = booksStore.getBookById(quote.bookId)
            return book && book.title === selectedBook.value
        })
    }
    if (selectedAuthor.value) {
        filtered = filtered.filter(quote => {
            const book = booksStore.getBookById(quote.bookId)
            return book && book.author === selectedAuthor.value
        })
    }
    if (favouriteOnly.value) {
        filtered = filtered.filter(q => q.favourite)
    }
    if (selectedColor.value) {
        filtered = filtered.filter(q => q.color === selectedColor.value)
    }
    // Sort quotes
    return filtered.sort((a, b) => {
        const dateA = new Date(a.dateHighlighted)
        const dateB = new Date(b.dateHighlighted)
        return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    })
})
// Color filter toggle
const toggleColorFilter = (color) => {
    selectedColor.value = selectedColor.value === color ? null : color
}

const paginatedQuotes = computed(() => {
    return filteredQuotes.value.slice(0, currentPage.value * pageSize.value)
})

const hasMoreQuotes = computed(() => {
    return paginatedQuotes.value.length < filteredQuotes.value.length
})

const export_svg_path = ref(mdiExportVariant)

// Methods
// const readFile = async () => {
//     file.value = docRef.value.files[0]
//     console.log(file.value)

//     if (file.value.name.includes('My Clippings')) {
//         alert('File uploaded successfully')

//         const reader = new FileReader()
//         reader.onload = async (res) => {
//             content.value = res.target.result.toString()

//             try {
//                 quotesStore.setLoading(true)
//                 const result = await dataProcessor.parseKindleClippings(content.value)

//                 alert(`Successfully imported ${result.quotesProcessed} quotes from ${result.booksProcessed} books!`)

//                 if (result.errors.length > 0) {
//                     console.warn('Some errors occurred during import:', result.errors)
//                 }
//             } catch (error) {
//                 console.error('Error processing file:', error)
//                 alert('Error processing file. Please try again.')
//             } finally {
//                 quotesStore.setLoading(false)
//             }
//         }

//         reader.onerror = (err) => console.log(err)
//         reader.readAsText(file.value)
//     } else {
//         content.value = ""
//         alert('Please upload My Clippings.txt')
//     }
// }

const handleDelete = async (quote) => {
    if (confirm('Do you want to delete this quote?')) {
        quotesStore.deleteQuote(quote.id)
        alert('The quote record has been deleted.')
    }
}

const handleEdit = async (quote) => {
    quotesStore.updateQuote(quote.id, {
        text: quote.text.trim(),
        // Add any other updated fields
    })
}

const exportFile = () => {
    const content = dataProcessor.exportToKindleFormat()
    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    })
    FileSaver.saveAs(blob, "My Clippings.txt")
}

const filterByBook = (book) => {
    if (selectedBook.value === book) {
        selectedBook.value = null
    } else {
        selectedBook.value = book
        selectedAuthor.value = null
    }
    currentPage.value = 1
}

const filterByAuthor = (author) => {
    if (selectedAuthor.value === author) {
        selectedAuthor.value = null
    } else {
        selectedAuthor.value = author
        selectedBook.value = null
    }
    currentPage.value = 1
}

const clearFilters = () => {
    selectedBook.value = null
    selectedAuthor.value = null
    currentPage.value = 1
}

const sortQuotes = () => {
    // Sorting is handled in the computed property
    currentPage.value = 1
}

const loadMore = () => {
    currentPage.value++
}

// Mobile sidebar methods
const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
    // Prevent body scroll when sidebar is open on mobile
    if (window.innerWidth < 768) {
        document.body.style.overflow = sidebarOpen.value ? 'hidden' : ''
    }
}

const closeSidebar = () => {
    sidebarOpen.value = false
    document.body.style.overflow = ''
}

// Close sidebar on window resize to desktop
const handleResize = () => {
    if (window.innerWidth >= 768 && sidebarOpen.value) {
        closeSidebar()
    }
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Initialize with sample data if needed
onMounted(() => {
    // Add resize event listener
    window.addEventListener('resize', handleResize)

    if (quotesStore.quoteCount === 0) {
        // Add some sample quotes with individual colors
        const sampleQuotes = [
            {
                text: 'It is our choices, Harry, that show what we truly are, far more than our abilities.',
                bookTitle: 'Harry Potter and the Chamber of Secrets',
                author: 'J.K. Rowling',
                location: '245',
                page: 120,
                tags: ['choices', 'character'],
                color: 'blue'
            },
            {
                text: 'Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.',
                bookTitle: 'Harry Potter and the Prisoner of Azkaban',
                author: 'J.K. Rowling',
                location: '387',
                page: 189,
                tags: ['hope', 'wisdom'],
                color: 'yellow'
            },
            {
                text: 'It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends.',
                bookTitle: 'Harry Potter and the Sorcerer\'s Stone',
                author: 'J.K. Rowling',
                location: '198',
                page: 95,
                tags: ['courage', 'friendship'],
                color: 'green'
            }
        ]

        sampleQuotes.forEach(quoteData => {
            // First ensure the book exists
            let book = booksStore.getBookByTitle(quoteData.bookTitle)
            if (!book) {
                book = booksStore.addBook({
                    title: quoteData.bookTitle,
                    author: quoteData.author,
                    tags: ['sample']
                })
            }

            // Add quote with book relationship
            const quote = quotesStore.addQuote({
                ...quoteData,
                bookId: book.id
            })

            // Link quote to book
            booksStore.addQuoteToBook(book.id, quote.id)
        })
    }
})

// Cleanup event listeners
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.body.style.overflow = '' // Reset body overflow
})
</script>

<style scoped>
/* Mobile responsiveness */
@media (max-width: 767px) {
    .sidebar-container {
        left: 0 !important;
        width: 280px !important;
        max-width: 85vw;
    }

    .main-content {
        margin-left: 0 !important;
        margin-right: 1rem !important;
        padding: 0 1rem;
    }

    .mobile-menu-btn {
        display: block;
    }
}

@media (min-width: 768px) {
    .mobile-menu-btn {
        display: none;
    }

    .sidebar-container {
        transform: translateX(0) !important;
    }
}

/* Smooth transitions */
.sidebar-container {
    transition: transform 0.3s ease-in-out;
}

.main-content {
    transition: margin 0.3s ease-in-out;
}

/* Ensure sidebar content is scrollable on mobile */
@media (max-width: 767px) {
    .sidebar-container {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
}
</style>