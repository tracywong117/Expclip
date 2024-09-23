<template>
<div>
    <nav class="flex my-2 mx-4 w-full justify-between items-center">
        <!-- Breadcrumb -->
        <ol class="flex space-x-2">
            <li>
                <router-link to="/" class="text-customPurple-600 hover:underline">
                    Home
                </router-link>
            </li>
            <li>
                <span class="text-gray-500">/</span>
            </li>
        </ol>
        <!-- Search Bar -->
        <div class="flex items-center pr-8">
            <div class="relative w-full w-4xl max-w-xl">
                <input type="text" placeholder="Search..." class="w-full p-[0.3rem] pl-10 border bg-transparent outline-none rounded-full focus:ring-2 focus:ring-purple-300" />
                <img src="/icons/search.svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" alt="Search" />
            </div>
        </div>
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
                    <p class="text-4xl leading-tight">20</p>
                </div>
                <div class="flex-1 flex flex-col items-center justify-center p-6 rounded-lg">
                    <p class="text-sm">The quotes you have MADE ...</p>
                    <p class="text-4xl leading-tight">100</p>
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
                    It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends
                </div>
                <span class="text-sm text-right">- J.K. Rowling</span>
            </div>

            <div class="px-10 py-8 rounded-lg border h-full">
                <span class="text-xl font-semibold block mb-3">Export</span>
                <span class="text-gray-400">You can export your highlights into the following format.</span>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="text-[14px] text-gray-500 cursor-pointer  
        rounded px-2 py-1 hover:bg-gray-50 flex items-center">
                        <img src="icons/pdf.svg" class="w-8 h-8 mr-2" alt="PDF icon" />
                        PDF
                    </div>
                    <div class="text-[14px] text-gray-500 cursor-pointer  
        rounded px-2 py-1 hover:bg-gray-50 flex items-center">
                        <img src="icons/txt.svg" class="w-8 h-8 mr-2" alt="TXT icon" />
                        TXT
                    </div>
                    <div class="text-[14px] text-gray-500 cursor-pointer  
        rounded px-2 py-1 hover:bg-gray-50 flex items-center">
                        <img src="icons/png.svg" class="w-8 h-8 mr-2" alt="PNG icon" />
                        PNG
                    </div>
                    <div class="text-[14px] text-gray-500 cursor-pointer  
        rounded px-2 py-1 hover:bg-gray-50 flex items-center">
                        <img src="icons/docx.svg" class="w-8 h-8 mr-2" alt="DOCX icon" />
                        DOCX
                    </div>
                    <div class="text-[14px] text-gray-500 cursor-pointer  
        rounded px-2 py-1 hover:bg-gray-50 flex items-center">
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

<script>
import BookItem from '@/components/BookItem.vue';
import ViewAll from '@/components/ViewAll.vue';

export default {
    components: {
        BookItem,
        ViewAll
    },
    data() {
        return {
            books: [{
                    image: 'images/harry-potter-1.jpg',
                    title: 'Harry Potter and the Sorcerer\'s Stone',
                    author: 'J.K. Rowling',
                    stars: 5,
                },
                {
                    image: 'images/harry-potter-2.jpg',
                    title: 'Harry Potter and the Chamber of Secrets',
                    author: 'J.K. Rowling',
                    stars: 3,
                },
                {
                    image: 'images/harry-potter-3.jpg',
                    title: 'Harry Potter and the Prisoner of Azkaban',
                    author: 'J.K. Rowling',
                    stars: 5,
                }
            ]

        };
    }
}
</script>
