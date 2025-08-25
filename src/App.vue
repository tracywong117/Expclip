<template>
<div id="app" class="flex">
    <!-- Sidebar -->
    <aside class="w-[250px] border-r hidden md:flex flex-col justify-between fixed h-full ">
        <nav class="flex flex-col items-center">
            <div class="flex justify-center pt-5 py-2">
                <img src="/icons/logo.svg" class="w-4/5" />
            </div>
            <div class="flex justify-start gap-4 self-start mx-8 mb-4">
                <Popover position="bottom" ref="addNewPopover">
                    <template #trigger>
                        <Tooltip position="bottom" autoHideDelay=0>
                            <button class="rounded-full flex p-2 bg-customPurple-200 hover:bg-customPurple-400 transition-colors duration-200 stroke-customPurple-900">
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                            <template #content>
                                Add new
                            </template>
                        </Tooltip>
                    </template>
                    <div class="py-1 flex flex-col text-[14px]">
                        <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                             @click="handleAddBook">
                            <span>Add new books</span>
                        </div>
                        <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                             @click="handleAddQuote">
                            <span>Add new quotes</span>
                        </div>
                    </div>
                </Popover>
                <Tooltip position="bottom" autoHideDelay=0>
                    <button class="rounded-full flex p-2 bg-customPurple-200 hover:bg-customPurple-400 transition-colors duration-200 stroke-customPurple-900" @click="showImportDialog=!showImportDialog">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <template #content>
                        Import from My Clippings.txt
                    </template>
                </Tooltip>
                <Tooltip position="bottom" autoHideDelay=0>
                    <button class="rounded-full flex p-2 bg-customPurple-200 hover:bg-customPurple-400 transition-colors duration-200 stroke-customPurple-900" @click="showImportDialog=!showImportDialog">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 3c3.0375661 0 5.5 2.46243388 5.5 5.5 0 1.3387897-.4783412 2.5658568-1.2734386 3.5196163l4.126992 4.1268303c.1952621.1952622.1952621.5118446 0 .7071068-.1735664.1735663-.4429908.1928515-.6378589.0578554l-.0692479-.0578554-4.1268303-4.126992c-.9537595.7950974-2.1808266 1.2734386-3.5196163 1.2734386-3.03756612 0-5.5-2.4624339-5.5-5.5 0-3.03756612 2.46243388-5.5 5.5-5.5zm0 1c-2.48528137 0-4.5 2.01471863-4.5 4.5 0 2.4852814 2.01471863 4.5 4.5 4.5 2.4852814 0 4.5-2.0147186 4.5-4.5 0-2.48528137-2.0147186-4.5-4.5-4.5z" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="#212121" />
                        </svg>

                    </button>
                    <template #content>
                        Search
                    </template>
                </Tooltip>

                <ImportKindleDialog 
                  :is-open="showImportDialog"
                  @close="showImportDialog = false"
                  @import-success="handleImportSuccess" />
            </div>
            <div class="w-full flex flex-col text-gray-500">
                <div v-for="item in navItems" :key="item.to" class="mb-2">
                    <router-link :to="item.to" class="flex items-center p-3 hover:bg-gray-100 mx-5 px-5 rounded-full" active-class="bg-violet-50">
                        <img :src="item.icon" class="w-7 h-7 mr-3" />
                        <span>{{ item.label }}</span>
                    </router-link>
                </div>
            </div>
        </nav>
        <nav class="flex flex-col items-center h-[70px]">
            <div class="w-full flex flex-row border-t justify-between items-center">
                <div>
                    <div class=""></div>
                    <DataBackupPopover />
                </div>
                <div class="flex gap-1">
                    <Tooltip position="top" autoHideDelay=0>
                        <div class="hover:bg-customPurple-200 p-2 rounded-lg cursor-pointer" @click="showAboutDialog = true">
                            <img src="/icons/help-line.svg" class="w-5 h-5" />
                        </div>
                        <template #content>
                            About Expclip
                        </template>
                    </Tooltip>
                    <Tooltip position="top" autoHideDelay=0>
                        <div class="hover:bg-customPurple-200 p-2 rounded-lg cursor-pointer" @click="showSettingsDialog = true">
                            <img src="/icons/settings-outline.svg" class="w-5 h-5" />
                        </div>
                        <template #content>
                            Settings
                        </template>
                    </Tooltip>
                </div>
                <div>
                </div>

            </div>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 md:ml-[250px] overflow-y-auto">
        <!-- Mobile Nav -->
        <div class="mobile-nav flex justify-between items-center p-4 shadow-md md:hidden">
            <img src="/icons/logo.svg" class="h-12" />
            <button @click="toggleNav" class="focus:outline-none">
                <span :class="{ 'transform rotate-45': isOpen }" class="block w-6 h-0.5 bg-black mb-1 transition-transform"></span>
                <span :class="{ 'opacity-0': isOpen }" class="block w-6 h-0.5 bg-black mb-1 transition-opacity"></span>
                <span :class="{ 'transform -rotate-45': isOpen }" class="block w-6 h-0.5 bg-black transition-transform"></span>
            </button>
        </div>

        <!-- Mobile Menu -->
        <div v-if="isMobile && isOpen" class="shadow-md md:hidden">
            <ul>
                <li>
                    <router-link to="/" class="block p-3 hover:bg-gray-200" active-class="active-link">Home</router-link>
                </li>
                <li>
                    <router-link to="/books" class="block p-3 hover:bg-gray-200 cursor-pointer" active-class="active-link">
                        Books
                    </router-link>
                </li>
                <li>
                    <router-link to="/quotes" class="block p-3 hover:bg-gray-200" active-class="active-link">Quotes</router-link>
                </li>
                <li>
                    <router-link to="/export" class="block p-3 hover:bg-gray-200" active-class="active-link">Export</router-link>
                </li>
            </ul>
        </div>

        <!-- Page Content -->
        <div class="page-container p-4">
            <router-view />
        </div>
    </main>

    <!-- Add Book Dialog -->
    <AddBookDialog 
      :is-open="showAddBookDialog"
      @close="showAddBookDialog = false"
      @book-added="handleBookAdded" />

    <!-- Add Quote Dialog -->
    <AddQuoteDialog 
      :is-open="showAddQuoteDialog"
      @close="showAddQuoteDialog = false"
      @quote-added="handleQuoteAdded" />

    <!-- About Dialog -->
    <AboutDialog 
      :is-open="showAboutDialog"
      @close="showAboutDialog = false" />

    <!-- Settings Dialog -->
    <SettingsDialog 
      :show="showSettingsDialog"
      @update:show="showSettingsDialog = $event" />
</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import DataBackupPopover from '@/components/DataBackupPopover.vue'
import Tooltip from '@/components/Tooltip.vue'
import Popover from '@/components/Popover.vue'
import Dialog from '@/components/Dialog.vue'
import AddBookDialog from '@/components/AddBookDialog.vue'
import AddQuoteDialog from '@/components/AddQuoteDialog.vue'
import ImportKindleDialog from '@/components/ImportKindleDialog.vue'
import AboutDialog from '@/components/AboutDialog.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'

// Initialize router
const router = useRouter()

// Reactive data
const navItems = ref([
    {
        to: '/',
        label: 'Home',
        icon: 'icons/house.svg'
    },
    {
        to: '/quotes',
        label: 'Quotes',
        icon: 'icons/bookmark.svg'
    },
    {
        to: '/books',
        label: 'Books',
        icon: 'icons/book.svg'
    },
    {
        to: '/stats',
        label: 'Statistics',
        icon: 'icons/line-chart.svg'
    },
    {
        to: '/export',
        label: 'Export',
        icon: 'icons/export.svg'
    }
])

const isOpen = ref(false)
const isMobile = ref(false)
const showBooks = ref(false)
const showImportDialog = ref(false)
const showAddBookDialog = ref(false)
const showAddQuoteDialog = ref(false)
const showAboutDialog = ref(false)
const showSettingsDialog = ref(false)
const addNewPopover = ref(null)

// Methods
const checkMobile = () => {
    isMobile.value = window.innerWidth < 900
}

const toggleNav = () => {
    isOpen.value = !isOpen.value
}

const handleImportSuccess = (data) => {
    // Handle successful import if needed
    console.log('Import completed successfully:', data)
}

const handleBookAdded = (newBook) => {
    // Navigate to the new book's page
    router.push(`/books/${newBook.id}`)
}

const handleQuoteAdded = (newQuote) => {
    // Navigate to the quotes page
    router.push('/quotes')
}

const handleAddBook = () => {
    showAddBookDialog.value = true
    // Close the popover
    if (addNewPopover.value && addNewPopover.value.closePopover) {
        addNewPopover.value.closePopover()
    }
}

const handleAddQuote = () => {
    showAddQuoteDialog.value = true
    // Close the popover
    if (addNewPopover.value && addNewPopover.value.closePopover) {
        addNewPopover.value.closePopover()
    }
}

// Lifecycle hooks
onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobile)
})
</script>

<style>
body {
    font-family: 'Poppins', 'Inter', 'DM Sans', 'Mona Sans', Arial, sans-serif;
    /* font-family: 'Inter', Arial, sans-serif; */
}

/* Tailwind CSS does not support @apply for pseudo-classes like :focus directly in global CSS.
    However, you can use @apply in a custom class and then use that class in your template. 
    For global focus styles, you still need to write plain CSS. 
    Example using Tailwind utility classes: */

input:focus,
textarea:focus,
select:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgb(139 92 246);
}

/* Note: This works only if your build setup supports @apply in selectors with pseudo-classes.
    If not, use Tailwind classes directly on your elements, or keep the plain CSS as before. */
</style>
