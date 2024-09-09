<template>
<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">All Books</h1>
        <div class="flex items-center space-x-4">
            <input type="number" v-model.number="booksPerPage" min="3" max="99" class="bg-white border border-gray-300 rounded px-2 py-1 w-20" />
            <button @click="toggleView" class="bg-blue-500 text-white px-4 py-2 rounded">
                Toggle {{ viewMode === 'grid' ? 'List' : 'Grid' }} View
            </button>
        </div>
    </div>

    <div class="flex justify-center">
        <div :class="viewMode" class="grid gap-20 md:px-5" v-if="viewMode === 'grid'">
            <div v-for="book in paginatedBooks" :key="book.id" class="border rounded-lg p-4 w-fit flex flex-col items-center justify-center cursor-pointer">
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
        <div v-for="book in paginatedBooks" :key="book.id" class="rounded-lg p-4 w-full hover:bg-lime-100 cursor-pointer flex justify-between items-center">
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
        <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="['px-3 py-1 mx-1 rounded', { 'bg-blue-500 text-white': currentPage === page, 'bg-gray-200': currentPage !== page }]">
            {{ page }}
        </button>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            books: [{
                    id: 1,
                    cover: 'data:image/jpeg;base64,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',
                    title: 'The Great Gatsby',
                    author: 'F. Scott Fitzgerald',
                    tags: ['Classic', 'Novel'],
                    stars: 4
                },
                {
                    id: 2,
                    cover: '',
                    title: 'To Kill a Mockingbird',
                    author: 'Harper Lee',
                    tags: ['Classic', 'Drama'],
                    stars: 5
                },
                {
                    id: 3,
                    cover: '',
                    title: '1984',
                    author: 'George Orwell',
                    tags: ['Dystopian', 'Science Fiction'],
                    stars: 4
                },
                {
                    id: 4,
                    cover: '',
                    title: 'Pride and Prejudice',
                    author: 'Jane Austen',
                    tags: ['Romance', 'Classic'],
                    stars: 5
                },
                {
                    id: 5,
                    cover: '',
                    title: 'The Catcher in the Rye',
                    author: 'J.D. Salinger',
                    tags: ['Classic', 'Coming-of-Age'],
                    stars: 3
                },
                {
                    id: 6,
                    cover: '',
                    title: 'Moby-Dick',
                    author: 'Herman Melville',
                    tags: ['Adventure', 'Classic'],
                    stars: 4
                },
                {
                    id: 7,
                    cover: '',
                    title: 'War and Peace',
                    author: 'Leo Tolstoy',
                    tags: ['Historical', 'Classic'],
                    stars: 5
                },
                {
                    id: 8,
                    cover: '',
                    title: 'The Odyssey',
                    author: 'Homer',
                    tags: ['Epic', 'Classic'],
                    stars: 4
                },
                {
                    id: 9,
                    cover: '',
                    title: 'Crime and Punishment',
                    author: 'Fyodor Dostoevsky',
                    tags: ['Classic', 'Psychological'],
                    stars: 5
                },
                {
                    id: 10,
                    cover: '',
                    title: 'Brave New World',
                    author: 'Aldous Huxley',
                    tags: ['Dystopian', 'Science Fiction'],
                    stars: 4
                }
            ],
            currentPage: 1,
            booksPerPage: 8,
            viewMode: 'grid' // 'list' or 'grid'
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
        }
    },
    methods: {
        toggleView() {
            this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        }
    }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.grid {
    grid-template-columns: repeat(4, 1fr);
}

.list {
    grid-template-columns: 1fr;
}
</style>
