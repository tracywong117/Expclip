<template>
<div class="flex h-screen ">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-md flex flex-col">
        <div class="p-4 flex-grow overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4">Filters</h2>
            <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Books</h3>
                <ul>
                    <li v-for="book in uniqueBooks" :key="book" @click="filterByBook(book)" class="cursor-pointer hover:bg-gray-200 p-2 rounded text-sm" :class="{ 'bg-blue-200': selectedBook === book }">
                        {{ book }}
                    </li>
                </ul>
            </div>
            <div>
                <h3 class="text-lg font-medium mb-2">Authors</h3>
                <ul>
                    <li v-for="author in uniqueAuthors" :key="author" @click="filterByAuthor(author)" class="cursor-pointer hover:bg-gray-200 p-2 rounded text-sm" :class="{ 'bg-blue-200': selectedAuthor === author }">
                        {{ author }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="p-4 border-t">
            <button @click="clearFilters" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Clear Filters
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
        <div class="p-8">
            <h1 class="text-3xl font-bold mb-6">Book Quotes</h1>

            <div class="mb-6 flex items-center space-x-4">
                <input type="file" ref="doc" @change="readFile" class="file-input" />
                <button @click="exportFile" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    <svg-icon type="mdi" :path="export_svg_path" class="inline-block mr-2"></svg-icon>
                    Export
                </button>
                <select v-model="sortOrder" @change="sortQuotes" class="border rounded px-2 py-1">
                    <option value="asc">Sort: Oldest First</option>
                    <option value="desc">Sort: Newest First</option>
                </select>
            </div>

            <div class="space-y-6">
                <div v-for="quote in paginatedQuotes" :key="quote.id">
                    <quote-content :quote="quote" @deleteQuote="handleDelete" @updateQuote="handleEdit" />
                </div>
            </div>

            <div class="mt-6 flex justify-center">
                <button @click="loadMore" v-if="hasMoreQuotes" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Load More
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import {
    mdiExportVariant
} from '@mdi/js';
import {
    dataProcessor
} from '@/utils/dataProcessor';
import FileSaver from "file-saver";
import {
    openDB
} from 'idb';
import Popover from '@/components/Popover.vue';
import QuoteContent from '@/components/QuoteContent.vue';

const DB_NAME = 'QuotesDB';
const STORE_NAME = 'quotes';

export default {
    components: {
        SvgIcon,
        Popover,
        QuoteContent,
    },
    data() {
        return {
            file: null,
            content: null,
            jsonRecords: [],
            export_svg_path: mdiExportVariant,
            selectedBook: null,
            selectedAuthor: null,
            sortOrder: 'desc',
            db: null,
            pageSize: 20,
            currentPage: 1,
        }
    },
    computed: {
        uniqueBooks() {
            return [...new Set(this.jsonRecords.map(record => record.Book))];
        },
        uniqueAuthors() {
            return [...new Set(this.jsonRecords.map(record => record.Author))];
        },
        filteredQuotes() {
            return this.jsonRecords.filter(quote =>
                (this.selectedBook ? quote.Book === this.selectedBook : true) &&
                (this.selectedAuthor ? quote.Author === this.selectedAuthor : true)
            );
        },
        paginatedQuotes() {
            return this.filteredQuotes.slice(0, this.currentPage * this.pageSize);
        },
        hasMoreQuotes() {
            return this.paginatedQuotes.length < this.filteredQuotes.length;
        },
    },
    async created() {
        this.db = await this.openDatabase();
        await this.loadQuotesFromDB();
    },
    methods: {
        async openDatabase() {
            return openDB(DB_NAME, 1, {
                upgrade(db) {
                    db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                },
            });
        },
        async loadQuotesFromDB() {
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            this.jsonRecords = await store.getAll();
            this.sortQuotes();
        },
        async saveQuotesToDB(quotes) {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            for (const quote of quotes) {
                await store.put(quote);
            }
        },
        async readFile() {
            this.file = this.$refs.doc.files[0];
            console.log(this.file);
            const reader = new FileReader();
            if (this.file.name.includes('My Clippings')) {
                alert('File uploaded successfully');
                reader.onload = async (res) => {
                    this.content = res.target.result.toString();
                    const newQuotes = dataProcessor.processClippingsFile(this.content);
                    await this.saveQuotesToDB(newQuotes);
                    await this.loadQuotesFromDB();
                };
                reader.onerror = (err) => console.log(err);
                reader.readAsText(this.file);
            } else {
                this.content = "";
                alert('Please upload My Clippings.txt');
            }
        },
        async handleDelete(id) {
            if (confirm('Do you want to delete this quote?')) {
                const tx = this.db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                await store.delete(id);
                await this.loadQuotesFromDB();
                alert('The quote record has been deleted.');
            }
        },
        async handleEdit(quote) {
            quote.Editable = false;
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            await store.put({
                ...quote,
                Quote: quote.Quote.trim()
            });
            await this.loadQuotesFromDB();
        },
        async exportFile() {
            const savePath = "My Clippings.txt";
            let content = dataProcessor.generateExportContent(this.jsonRecords);
            var blob = new Blob([content], {
                type: "text/plain;charset=utf-8"
            });
            FileSaver.saveAs(blob, savePath);
        },
        filterByBook(book) {
            if (this.selectedBook === book) {
                this.selectedBook = null;
            } else {
                this.selectedBook = book;
                this.selectedAuthor = null;
            }
            this.currentPage = 1;
        },
        filterByAuthor(author) {
            if (this.selectedAuthor === author) {
                this.selectedAuthor = null;
            } else {
                this.selectedAuthor = author;
                this.selectedBook = null;
            }
            this.currentPage = 1;
        },
        clearFilters() {
            this.selectedBook = null;
            this.selectedAuthor = null;
            this.currentPage = 1;
        },
        sortQuotes() {
            this.jsonRecords.sort((a, b) => {
                const dateA = new Date(a.Datetime);
                const dateB = new Date(b.Datetime);
                return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        loadMore() {
            this.currentPage++;
        },
    }
}
</script>
