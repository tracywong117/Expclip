<template>
    <div class="container mx-auto p-4">
        <!-- Loading state -->
        <div v-if="!book" class="text-center py-8">
            <p class="text-gray-500">Book not found</p>
            <router-link to="/books" class="text-blue-500 hover:text-blue-700">← Back to Books</router-link>
        </div>

        <!-- Book content -->
        <div v-else>
            <!-- Book Header -->
            <div class="flex flex-col md:flex-row items-center gap-6 mb-6">
                <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="w-64 h-64 object-cover rounded-lg" />
                <div v-else class="w-64 h-64 border flex justify-center items-center rounded-lg bg-gray-50">
                    <span class="text-gray-400">No Cover Available</span>
                </div>

                <div class="flex flex-col flex-1">
                    <!-- Display Mode -->
                    <div v-if="!isEditing">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h1 class="text-3xl font-bold mb-2">{{ book.title }}</h1>
                                <p class="text-lg text-gray-600 mb-4">by {{ book.author }}</p>
                            </div>
                            <button @click="startEditing"
                                class="bg-customPurple-200 hover:bg-customPurple-400 text-customPurple-900 px-4 py-1 rounded">
                                Edit
                            </button>
                        </div>

                        <!-- Star Rating -->
                        <div class="flex items-center mb-4">
                            <span v-for="star in 5" :key="star" @click="updateStars(star)"
                                class="text-amber-300 cursor-pointer text-xl hover:text-amber-400">
                                <i v-if="star <= book.stars" class="fas fa-star mr-1"></i>
                                <i v-else class="far fa-star mr-1"></i>
                            </span>
                            <span class="ml-2 text-gray-500">({{ book.stars }}/5)</span>
                        </div>

                        <!-- Book Stats -->
                        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                                <strong>Quotes:</strong> {{ bookQuotes.length }}
                            </div>
                            <div>
                                <strong>Favorites quotes:</strong> {{ favoriteQuotes.length }}
                            </div>
                            <div>
                                <strong>Date Added:</strong> {{ formatDate(book.dateAdded) }}
                            </div>
                            <div>
                                <strong>Last Updated:</strong> {{ formatDate(book.lastModified) }}
                            </div>
                        </div>

                        <!-- Additional Information Display -->
                        <div v-if="book.additionalInfo && Object.keys(book.additionalInfo).length > 0" class="mb-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div v-for="(value, key) in book.additionalInfo" :key="key"
                                    class="flex justify-between">
                                    <span class="font-medium text-gray-700"><strong>{{ key }}:</strong> {{ value }}</span>
                                    <!-- <span class="text-gray-600">{{ value }}</span> -->
                                </div>
                            </div>
                        </div>

                        <!-- Tags Display -->
                        <div v-if="book.tags && book.tags.length > 0" class="flex flex-wrap gap-2">
                            <span v-for="tag in book.tags" :key="tag"
                                class="inline-block bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full">
                                {{ tag }}
                            </span>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <div v-else>
                        <div class="space-y-4">
                            <!-- Title and Author -->
                            <div class="flex gap-2 items-end">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input v-model="editForm.title"
                                        class="w-full p-3 border rounded text-lg font-semibold"
                                        placeholder="Book Title">
                                </div>
                                
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input v-model="editForm.author" class="w-full p-3 border rounded"
                                    placeholder="Author Name">
                            </div>

                            <!-- Cover URL -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                                <input v-model="editForm.cover" class="w-full p-3 border rounded"
                                    placeholder="https://example.com/cover.jpg">
                            </div>

                            <!-- Rating -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div class="flex items-center">
                                    <span v-for="star in 5" :key="star" @click="editForm.stars = star"
                                        class="text-amber-300 cursor-pointer text-xl hover:text-amber-400">
                                        <i v-if="star <= editForm.stars" class="fas fa-star mr-1"></i>
                                        <i v-else class="far fa-star mr-1"></i>
                                    </span>
                                    <span class="ml-2 text-gray-500">({{ editForm.stars }}/5)</span>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tags
                                    (comma-separated)</label>
                                <input v-model="tagsInput" class="w-full p-3 border rounded"
                                    placeholder="Classic, Fiction, Romance">
                            </div>

                            <!-- Additional Information -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Additional
                                    Information</label>
                                <div v-for="(field, index) in editableFields" :key="index"
                                    class="flex gap-2 items-center mb-2">
                                    <input v-model="field.key" placeholder="Field name (e.g., Genre, Year, Publisher)"
                                        class="flex-1 p-2 border rounded">
                                    <input v-model="field.value" placeholder="Value" class="flex-1 p-2 border rounded">
                                    <button @click="removeField(index)" class="text-red-500 hover:text-red-700 px-2">
                                        ✕
                                    </button>
                                </div>

                                <button @click="addField"
                                    class="bg-white text-blue-500 border border-blue-300 px-3 py-1 rounded hover:bg-blue-100 text-sm">
                                    Add Field
                                </button>

                                <div class="mt-5 flex w-full justify-end">
                                    <div class="flex gap-2">
                                        <button @click="saveChanges"
                                            class="bg-blue-200 text-blue-800 hover:bg-blue-300 px-3 py-1 rounded">
                                            Save
                                        </button>
                                        <button @click="cancelEditing"
                                            class="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1 rounded">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quotes Section -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Quotes ({{ bookQuotes.length }})</h2>
                    <div class="flex gap-2">
                        <button @click="showFavoritesOnly = !showFavoritesOnly"
                            :class="showFavoritesOnly ? 'bg-white text-customPurple-900 border hover:bg-customPurple-300 border-customPurple-500' : 'bg-white border border-yellow-400 text-yellow-600 hover:bg-yellow-100'"
                            class="px-3 py-1 rounded text-sm">
                            {{ showFavoritesOnly ? 'Show All' : 'Favorites Only' }}
                        </button>
                    </div>
                </div>

                <div v-if="displayedQuotes.length === 0" class="text-gray-500 text-center py-8">
                    <p>{{ showFavoritesOnly ? 'No favorite quotes yet.' : 'No quotes available for this book.' }}</p>
                </div>

                <div v-else class="space-y-4">
                    <QuoteContent v-for="quote in displayedQuotes" :key="quote.id" :quote="quote" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useQuotesStore } from '@/stores/quotes'
import QuoteContent from '@/components/QuoteContent.vue'

export default {
    components: {
        QuoteContent
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const booksStore = useBooksStore()
        const quotesStore = useQuotesStore()

        // Reactive data
        const book = ref(null)
        const isEditing = ref(false)
        const isEditingInfo = ref(false)
        const editableFields = ref([])
        const showFavoritesOnly = ref(false)
        const editForm = ref({})
        const tagsInput = ref('')

        // Computed properties
        const bookQuotes = computed(() => {
            if (!book.value) return []
            return quotesStore.getQuotesByBook(book.value.id)
        })

        const favoriteQuotes = computed(() => {
            return bookQuotes.value.filter(quote => quote.isFavorite)
        })

        const displayedQuotes = computed(() => {
            return showFavoritesOnly.value ? favoriteQuotes.value : bookQuotes.value
        })

        // Methods
        const loadBook = () => {
            const bookId = route.params.id
            const foundBook = booksStore.getBookById(bookId)

            if (foundBook) {
                book.value = foundBook
                if (!book.value.additionalInfo) {
                    book.value.additionalInfo = {}
                }
                setupEditableFields()
            } else {
                console.error('Book not found:', bookId)
            }
        }

        const setupEditableFields = () => {
            const info = book.value?.additionalInfo || {}
            editableFields.value = Object.entries(info).map(([key, value]) => ({
                key: key,
                value: value
            }))

            // Add an empty field if none exist
            if (editableFields.value.length === 0) {
                editableFields.value.push({ key: '', value: '' })
            }
        }

        const startEditing = () => {
            isEditing.value = true
            // Initialize edit form with current book data
            editForm.value = {
                title: book.value.title,
                author: book.value.author,
                cover: book.value.cover || '',
                stars: book.value.stars
            }
            // Setup tags input
            tagsInput.value = book.value.tags ? book.value.tags.join(', ') : ''
            // Setup additional fields including all current info
            setupEditableFields()
        }

        const cancelEditing = () => {
            isEditing.value = false
            editForm.value = {}
            tagsInput.value = ''
            setupEditableFields() // Reset fields
        }

        const saveChanges = () => {
            if (!book.value) return

            // Process tags
            const tags = tagsInput.value
                ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                : []

            // Process additional info
            const newAdditionalInfo = {}
            editableFields.value.forEach(field => {
                if (field.key.trim() && field.value.trim()) {
                    newAdditionalInfo[field.key.trim()] = field.value.trim()
                }
            })

            // Update the book
            const updatedBook = {
                ...book.value,
                title: editForm.value.title,
                author: editForm.value.author,
                cover: editForm.value.cover,
                stars: editForm.value.stars,
                tags: tags,
                additionalInfo: newAdditionalInfo,
                lastModified: new Date().toISOString()
            }

            booksStore.updateBook(book.value.id, updatedBook)

            // Update local book reference
            book.value = updatedBook

            isEditing.value = false
        }

        const addField = () => {
            editableFields.value.push({ key: '', value: '' })
        }

        const removeField = (index) => {
            editableFields.value.splice(index, 1)

            // Ensure at least one field exists
            if (editableFields.value.length === 0) {
                editableFields.value.push({ key: '', value: '' })
            }
        }

        // Cancel editing when escape is pressed
        const handleKeydown = (event) => {
            if (event.key === 'Escape' && isEditing.value) {
                cancelEditing()
            }
        }

        const formatDate = (dateString) => {
            if (!dateString) return 'Unknown'
            try {
                return new Date(dateString).toLocaleDateString()
            } catch (error) {
                return 'Invalid Date'
            }
        }

        // Watch for route changes
        watch(() => route.params.id, () => {
            loadBook()
        })

        const updateStars = (starCount) => {
            if (isEditing.value) {
                editForm.value.stars = starCount
            } else {
                if (!book.value) return

                booksStore.updateBook(book.value.id, {
                    ...book.value,
                    stars: starCount,
                    lastModified: new Date().toISOString()
                })

                book.value.stars = starCount
                book.value.lastModified = new Date().toISOString()
            }
        }

        // Watch for route changes
        watch(() => route.params.id, () => {
            loadBook()
        })
        // Lifecycle
        onMounted(() => {
            loadBook()
            document.addEventListener('keydown', handleKeydown)
        })

        onUnmounted(() => {
            document.removeEventListener('keydown', handleKeydown)
        })

        return {
            book,
            bookQuotes,
            favoriteQuotes,
            displayedQuotes,
            isEditing,
            isEditingInfo,
            editableFields,
            showFavoritesOnly,
            editForm,
            tagsInput,
            startEditing,
            cancelEditing,
            saveChanges,
            addField,
            removeField,
            updateStars,
            formatDate
        }
    }
}
</script>

<style scoped>
textarea {
    resize: vertical;
}

.container {
    max-width: 1200px;
}

.grid {
    gap: 1rem;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>
