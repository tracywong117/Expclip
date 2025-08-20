<template>
<div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Statistics</h1>
    
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg border p-6 text-center">
            <div class="text-3xl font-bold text-blue-600">{{ bookCount }}</div>
            <div class="text-gray-600">Total Books</div>
        </div>
        
        <div class="bg-white rounded-lg border p-6 text-center">
            <div class="text-3xl font-bold text-green-600">{{ quoteCount }}</div>
            <div class="text-gray-600">Total Quotes</div>
        </div>
        
        <div class="bg-white rounded-lg border p-6 text-center">
            <div class="text-3xl font-bold text-purple-600">{{ favoriteQuotesCount }}</div>
            <div class="text-gray-600">Favorite Quotes</div>
        </div>
        
        <div class="bg-white rounded-lg border p-6 text-center">
            <div class="text-3xl font-bold text-orange-600">{{ avgQuotesPerBook }}</div>
            <div class="text-gray-600">Avg Quotes/Book</div>
        </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Books by Author Chart -->
        <div class="bg-white rounded-lg border p-6">
            <h2 class="text-xl font-semibold mb-4">Books by Author</h2>
            <div class="relative h-64" v-if="topAuthors.length > 0">
                <canvas ref="authorsChart"></canvas>
            </div>
            <div v-else class="h-64 flex items-center justify-center text-gray-500">
                No data available
            </div>
        </div>

        <!-- Quotes Timeline Chart -->
        <div class="bg-white rounded-lg border p-6">
            <h2 class="text-xl font-semibold mb-4">Quotes Over Time</h2>
            <div class="relative h-64" v-if="quoteCount > 0">
                <canvas ref="timelineChart"></canvas>
            </div>
            <div v-else class="h-64 flex items-center justify-center text-gray-500">
                No data available
            </div>
        </div>
    </div>

    <!-- Top Authors and Books -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Authors -->
        <div class="bg-white rounded-lg border p-6">
            <h2 class="text-xl font-semibold mb-4">Top Authors</h2>
            <div class="space-y-3">
                <div v-for="author in topAuthors" :key="author.name" 
                     class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span class="font-medium">{{ author.name }}</span>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {{ author.count }} quotes
                    </span>
                </div>
            </div>
        </div>

        <!-- Most Highlighted Books -->
        <div class="bg-white rounded-lg border p-6">
            <h2 class="text-xl font-semibold mb-4">Most Highlighted Books</h2>
            <div class="space-y-3">
                <div v-for="book in mostHighlightedBooks" :key="book.title" 
                     class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                        <div class="font-medium">{{ book.title }}</div>
                        <div class="text-sm text-gray-600">{{ book.author }}</div>
                    </div>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {{ book.highlightCount }} highlights
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useBooksStore, useQuotesStore } from '@/stores'
import Chart from 'chart.js/auto'

// Store instances
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()

// Chart refs
const authorsChart = ref(null)
const timelineChart = ref(null)
const authorsChartInstance = ref(null)
const timelineChartInstance = ref(null)

// Computed statistics
const bookCount = computed(() => booksStore.bookCount)
const quoteCount = computed(() => quotesStore.quoteCount)
const favoriteQuotesCount = computed(() => quotesStore.favoriteQuotes.length)
const avgQuotesPerBook = computed(() => {
    if (bookCount.value === 0) return 0
    return Math.round((quoteCount.value / bookCount.value) * 10) / 10 // Round to 1 decimal
})

const topAuthors = computed(() => {
    if (!quotesStore.quotes || quotesStore.quotes.length === 0) return []
    
    const authorCounts = {}
    quotesStore.quotes.forEach(quote => {
        const book = booksStore.getBookById(quote.bookId)
        const author = book?.author || 'Unknown Author'
        authorCounts[author] = (authorCounts[author] || 0) + 1
    })
    
    return Object.entries(authorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
})

const mostHighlightedBooks = computed(() => {
    if (!quotesStore.quotes || quotesStore.quotes.length === 0) return []
    
    const bookCounts = {}
    quotesStore.quotes.forEach(quote => {
        const book = booksStore.getBookById(quote.bookId)
        if (book) {
            const bookKey = `${book.title}|${book.author}`
            if (!bookCounts[bookKey]) {
                bookCounts[bookKey] = {
                    title: book.title,
                    author: book.author,
                    highlightCount: 0
                }
            }
            bookCounts[bookKey].highlightCount++
        }
    })
    
    return Object.values(bookCounts)
        .sort((a, b) => b.highlightCount - a.highlightCount)
        .slice(0, 5)
})

// Chart creation functions
const createAuthorsChart = () => {
    if (!authorsChart.value || authorsChartInstance.value) return
    
    const authors = topAuthors.value.slice(0, 5)
    if (authors.length === 0) return
    
    try {
        const ctx = authorsChart.value.getContext('2d')
        
        authorsChartInstance.value = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: authors.map(a => a.name),
                datasets: [{
                    data: authors.map(a => a.count),
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#8B5CF6',
                        '#F59E0B',
                        '#EF4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error creating authors chart:', error)
    }
}

const createTimelineChart = () => {
    if (!timelineChart.value || timelineChartInstance.value) return
    
    // Group quotes by month
    const monthCounts = {}
    quotesStore.quotes.forEach(quote => {
        try {
            const date = new Date(quote.dateHighlighted)
            if (!isNaN(date.getTime())) {
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
            }
        } catch (error) {
            console.warn('Invalid date for quote:', quote.dateHighlighted)
        }
    })
    
    const sortedMonths = Object.keys(monthCounts).sort()
    if (sortedMonths.length === 0) return
    
    try {
        const ctx = timelineChart.value.getContext('2d')
        
        timelineChartInstance.value = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-')
                    return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                }),
                datasets: [{
                    label: 'Quotes Added',
                    data: sortedMonths.map(month => monthCounts[month]),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error creating timeline chart:', error)
    }
}

// Lifecycle
onMounted(() => {
    console.log('Statistics component mounted')
    console.log('Book count:', bookCount.value)
    console.log('Quote count:', quoteCount.value)
    console.log('Top authors:', topAuthors.value)
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Creating charts...')
        createAuthorsChart()
        createTimelineChart()
    }, 500) // Increased delay
})

onBeforeUnmount(() => {
    console.log('Cleaning up charts...')
    // Cleanup charts
    if (authorsChartInstance.value) {
        authorsChartInstance.value.destroy()
        authorsChartInstance.value = null
    }
    if (timelineChartInstance.value) {
        timelineChartInstance.value.destroy()
        timelineChartInstance.value = null
    }
})
</script>

<style scoped>
canvas {
    max-height: 100%;
    max-width: 100%;
}

.relative {
    position: relative;
    overflow: hidden;
}
</style>
