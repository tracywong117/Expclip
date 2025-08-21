<template>
<div>
    <nav class="flex my-2 mx-4 w-full justify-between items-center">
        <!-- Breadcrumb -->
        <!-- <ol class="flex space-x-2">
            <li>
                <div class="text-customPurple-600">
                    Home
                </div>
            </li>
            <li>
                <span class="text-gray-500">/</span>
            </li>
        </ol> -->
        <!-- Search Bar -->
        <!-- <div class="flex items-center pr-8">
            <div class="relative w-full w-4xl max-w-xl">
                <input type="text" placeholder="Search..." class="w-full p-[0.3rem] pl-10 border bg-transparent outline-none rounded-full focus:ring-2 focus:ring-purple-300" />
                <img src="/icons/search.svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" alt="Search" />
            </div>
        </div> -->
    </nav>

    <div class="container mx-auto p-4">
        <!-- Grid Container -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Favourite Book / Recent Read Book -->
            <div class="md:col-span-2">
                <div class="px-10 py-8 rounded-lg border h-full">
                    <div class="flex flex-row items-center justify-between mb-4">
                        <span class="text-xl font-semibold ">Your Favourite Books</span>
                        <ViewAll to="/books" />
                    </div>
                    <BookItem v-for="book in books" :key="book.title" :book="book" />
                </div>
            </div>

            <!-- Stats -->
            <div class="flex flex-col justify-between space-y-4 px-10 py-8 border rounded-lg">
                <div class="flex flex-row items-center justify-between mb-4">
                    <span class="text-xl font-semibold ">Statistics</span>
                    <ViewAll to="/stats" />
                </div>
                <div class="flex-1 flex flex-col items-center justify-center p-6 rounded-lg">
                    <p class="text-sm">The books you have READ ...</p>
                    <p class="text-4xl leading-tight">{{ stats.booksRead }}</p>
                </div>
                <div class="flex-1 flex flex-col items-center justify-center p-6 rounded-lg">
                    <p class="text-sm">The quotes you have MADE ...</p>
                    <p class="text-4xl leading-tight">{{ stats.quotesMade }}</p>
                </div>
            </div>

        </div>
    </div>

    <div class="container mx-auto p-4">
        <!-- Grid Container -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Today's Quote -->
            <div class="flex flex-col justify-between space-y-4 px-10 py-8 border rounded-lg">
                <div class="flex flex-row items-center justify-between mb-4">
                    <div>
                        <img src="icons/block-quote-line.svg" class="w-20 h-20 text-gray-400" />
                        <span class="text-xl font-semibold ">Today's Quote</span>
                    </div>
                    <ViewAll to="/quotes" />

                </div>
                <div>
                    {{ todayQuote.text }}
                </div>
                <span class="text-sm text-right">- {{ todayQuote.author }}</span>
            </div>

            <div class="px-10 py-8 rounded-lg border h-full">
                <span class="text-xl font-semibold block mb-3">Export</span>
                <span class="text-gray-400">You can export your highlights into the following format.</span>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="text-[14px] text-gray-500  
        rounded px-2 py-1 flex items-center">
                        <img src="icons/pdf.svg" class="w-8 h-8 mr-2" alt="PDF icon" />
                        PDF
                    </div>
                    <div class="text-[14px] text-gray-500  
        rounded px-2 py-1 flex items-center">
                        <img src="icons/txt.svg" class="w-8 h-8 mr-2" alt="TXT icon" />
                        TXT
                    </div>
                    <!-- <div class="text-[14px] text-gray-500  
        rounded px-2 py-1 flex items-center">
                        <img src="icons/png.svg" class="w-8 h-8 mr-2" alt="PNG icon" />
                        PNG
                    </div> -->
                    <div class="text-[14px] text-gray-500  
        rounded px-2 py-1 flex items-center">
                        <img src="icons/docx.svg" class="w-8 h-8 mr-2" alt="DOCX icon" />
                        DOCX
                    </div>
                    <div class="text-[14px] text-gray-500  
        rounded px-2 py-1 flex items-center">
                        <img src="icons/csv.svg" class="w-8 h-8 mr-2" alt="CSV icon" />
                        CSV
                    </div>
                </div>
            </div>
            <!-- <span class="text-xl font-semibold">Import Highlights from Kindle</span> -->
            <!-- <label class="mt-4 border-dashed border-2 border-gray-300 p-10 text-center cursor-pointer hover:border-gray-400 transition block">
                    <p class="text-lg">
                        <div class="flex flex-col items-center">
                            <img src="icons/file-text.svg" class="w-10 h-10 mb-2" />
                            <p>Drop <em class="text-lime-600">My Clipping.txt</em> here</p>
                        </div>
                    </p>
                    <input type="file" class="hidden" />
                </label> -->

        </div>
    </div>

</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useBooksStore, useQuotesStore } from '@/stores'
import BookItem from '@/components/BookItem.vue'
import ViewAll from '@/components/ViewAll.vue'

// Initialize stores
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()

// Computed properties from stores
const books = computed(() => {
    // Get all books, shuffle them, and take the first 3
    const allBooks = [...booksStore.books]
    const shuffled = allBooks.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
})
const stats = computed(() => ({
    booksRead: booksStore.bookCount,
    quotesMade: quotesStore.quoteCount
}))

const todayQuote = computed(() => {
    const recentQuotes = quotesStore.recentQuotes
    if (recentQuotes.length > 0) {
        // Get a random quote from recent quotes for "today's quote"
        const randomIndex = Math.floor(Math.random() * recentQuotes.length)
        const quote = recentQuotes[randomIndex]
        const book = booksStore.getBookById(quote.bookId)
        return {
            text: quote.text,
            author: book?.author || 'Unknown Author'
        }
    }
    
    // Fallback quote if no quotes exist
    return {
        text: 'It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends.',
        author: 'J.K. Rowling'
    }
})

// Initialize with some sample data if stores are empty
onMounted(() => {
    if (booksStore.bookCount === 0) {
        // Add some sample books
        const book1 = booksStore.addBook({
            title: 'Harry Potter and the Sorcerer\'s Stone',
            author: 'J.K. Rowling',
            stars: 5,
            cover: 'https://media.harrypotterfanzone.com/sorcerers-stone-us-childrens-edition.jpg',
            isFavorite: true,
            tags: ['fantasy', 'young-adult']
        })
        const book2 = booksStore.addBook({
            title: 'Harry Potter and the Chamber of Secrets',
            author: 'J.K. Rowling',
            stars: 3,
            cover: 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_568,c_scale,dpr_1.5/jackets/9781408855669.jpg',
            isFavorite: true,
            tags: ['fantasy', 'young-adult']
        })
        const book3 = booksStore.addBook({
            title: 'Harry Potter and the Prisoner of Azkaban',
            author: 'J.K. Rowling',
            stars: 5,
            isFavorite: true,
            // tags: ['fantasy', 'young-adult']
        })

        // Add some sample quotes linked to books
        if (quotesStore.quoteCount === 0) {
            const quote1 = quotesStore.addQuote({
                text: 'It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends.',
                bookId: book1.id,
                // tags: ['wisdom', 'courage'],
                color: 'yellow'
            })
            
            const quote2 = quotesStore.addQuote({
                text: 'It is our choices, Harry, that show what we truly are, far more than our abilities.',
                bookId: book2.id,
                // tags: ['choices', 'character'],
                color: 'blue'
            })

            // Link quotes to books
            booksStore.addQuoteToBook(book1.id, quote1.id)
            booksStore.addQuoteToBook(book2.id, quote2.id)
        }
    }
})
</script>
