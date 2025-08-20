<template>
<div :class="`p-6 border-l-4 ${bgColor} ${borderColor}`">
    <div v-if="!isEditing">
        <p class="text-lg mb-4 leading-relaxed">{{ quote.text }}</p>
    </div>
    <div v-else class="mb-4">
        <textarea v-model="editedText" placeholder="Enter quote" class="w-full p-2 border rounded text-lg"></textarea>
    </div>
    <div class="flex justify-between">
        <div>
            <span class="font-semibold text-gray-800">{{ bookTitle }}</span>
            <span class="ml-2 text-sm text-gray-600">{{ bookAuthor }}</span>
        </div>
        <div>
            <span v-if="quote.page" class="text-sm text-gray-500">Page {{ quote.page }}</span>
            <span v-if="quote.location" class="ml-2 text-sm text-gray-500">Location {{ quote.location }}</span>
            <span class="ml-2 text-sm text-gray-500">{{ formatDate(quote.dateHighlighted) }}</span>
        </div>
    </div>
    <div class="flex justify-between mt-2 items-start">
        <div class="flex items-center space-x-2">
            <HeartIcon :is-favorite="quote.isFavorite" @toggle="toggleFavorite" />
            <HighlightPopover :color="quoteColor" @changeColor="updateColor" />
            <div v-if="quote.tags && quote.tags.length > 0" class="flex flex-wrap gap-1">
                <span v-for="tag in quote.tags" :key="tag" 
                      class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {{ tag }}
                </span>
            </div>
        </div>
        <div class="flex space-x-2 text-[14px]">
            <button v-if="!isEditing" @click="startEdit" 
                    class="border border-slate-300 text-slate-800 hover:bg-slate-200 px-3 py-1 rounded">
                Edit
            </button>
            <button v-if="isEditing" @click="saveEdit" 
                    class="bg-blue-200 text-blue-800 hover:bg-blue-300 px-3 py-1 rounded">
                Save
            </button>
            <button v-if="isEditing" @click="cancelEdit" 
                    class="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1 rounded">
                Cancel
            </button>
            <button @click="deleteQuote" 
                    class="bg-red-200 text-red-800 hover:bg-red-400 hover:text-red-900 px-3 py-1 rounded">
                Delete
            </button>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuotesStore, useBooksStore } from '@/stores'
import HeartIcon from './HeartIcon.vue'
import HighlightPopover from './HighlightPopover.vue'

// Props
const props = defineProps({
    quote: {
        type: Object,
        required: true
    }
})

// Stores
const quotesStore = useQuotesStore()
const booksStore = useBooksStore()

// Reactive data
const isEditing = ref(false)
const editedText = ref('')
const quoteColor = ref(props.quote.color || 'yellow')

// Computed properties for book information
const book = computed(() => {
    return booksStore.getBookById(props.quote.bookId)
})

const bookTitle = computed(() => {
    return book.value?.title || 'Unknown Book'
})

const bookAuthor = computed(() => {
    return book.value?.author || 'Unknown Author'
})

const borderColor = computed(() => `border-${quoteColor.value}-400`)
const bgColor = computed(() => `bg-${quoteColor.value}-50`)

// Methods
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const toggleFavorite = () => {
    quotesStore.toggleFavorite(props.quote.id)
}

const updateColor = (newColor) => {
    quoteColor.value = newColor
    quotesStore.updateQuote(props.quote.id, { color: newColor })
}

const startEdit = () => {
    isEditing.value = true
    editedText.value = props.quote.text
}

const saveEdit = () => {
    quotesStore.updateQuote(props.quote.id, { text: editedText.value })
    isEditing.value = false
}

const cancelEdit = () => {
    isEditing.value = false
    editedText.value = ''
}

const deleteQuote = () => {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotesStore.deleteQuote(props.quote.id)
    }
}
</script>
