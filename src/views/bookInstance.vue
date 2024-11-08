<template>
<div class="container mx-auto p-4">
    <div class="flex flex-col md:flex-row items-center gap-6 mb-6">
        <img v-if="book.cover" :src="book.cover" alt="Book Cover" class="w-64 h-64 object-cover rounded-lg" />
        <div v-if="!book.cover" class="w-64 h-64 border flex justify-center items-center">
            <span>No Cover Available</span>
        </div>
        <div class="flex flex-col">
            <h1 class="text-3xl font-bold">{{ book.title }}</h1>
            <p class="text-lg text-gray-500 mb-2">by {{ book.author }}</p>
            <p class="text-md text-gray-500 mb-4">Publisher: {{ book.publisher }}</p>
            <p class="text-md text-gray-500 mb-4">ISBN: {{ book.isbn }}</p>
            <div class="flex items-center mb-4">
                <span v-for="star in 5" :key="star" class="text-amber-300">
                    <i v-if="star <= book.stars" class="fas fa-star mr-1"></i>
                    <i v-else class="far fa-star mr-1"></i>
                </span>
            </div>
        </div>
    </div>

    <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2">Notes</h2>
        <textarea v-model="book.notes" class="w-full h-32 p-2 border rounded-md"></textarea>
    </div>

    <div>
        <h2 class="text-2xl font-bold mb-2">Quotes</h2>
        <ul class="list-disc pl-5">
            <li v-for="(quote, index) in book.quotes" :key="index" class="mb-2">
                {{ quote }}
            </li>
        </ul>
    </div>
</div>
</template>

  
  
<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            book: {
                title: this.title.replace(/-/g, ' '), // Example transformation
                author: 'Author Name',
                publisher: 'Publisher Name',
                isbn: '123-4567890123',
                stars: 4,
                notes: '',
                quotes: [
                    'This is a great quote from the book.',
                    'Another insightful quote here.',
                ],
            },
        };
    },
};
</script>
  
  
<style scoped>
textarea {
    resize: vertical;
}
</style>
