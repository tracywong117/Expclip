<template>
<div id="app" class="flex">
    <!-- Sidebar -->
    <aside class="w-[250px] border-r hidden md:flex flex-col justify-between fixed h-full ">
        <nav class="flex flex-col items-center">
            <div class="flex justify-center pt-5 py-2">
                <img src="/icons/logo.svg" class="w-4/5" />
            </div>
            <div class="flex justify-start gap-4 self-start mx-8 mb-4">
                <Popover position="bottom">
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
                        <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                            <span>Add new books</span>
                        </div>
                        <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
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
                        Add new
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

                <Dialog v-model:show="showImportDialog">
                    <div class="text-xl font-semibold mb-3">Import Highlights from Kindle</div>
                    <div class="text-md text-gray-500 mb-3">
                        Kindle Clippings is the file that contains all the highlights and notes you've made on your Kindle device. You can import this file to get all your highlights and notes in one place.
                    </div>
                    <label class="border-dashed border-2 border-gray-300 p-10 text-center cursor-pointer hover:border-gray-400 transition block w-[50%] mx-auto">
                        <div class="flex flex-col items-center">
                            <img src="icons/file-text.svg" class="w-10 h-10 mb-2" alt="File icon" />
                            <p v-if="!fileName" class="text-lg">
                                Drop <em class="text-customPurple-600">My Clipping.txt</em> here
                            </p>
                            <p v-else class="text-lg">
                                Selected file: <em class="text-customPurple-600">{{ fileName }}</em>
                            </p>
                        </div>
                        <input type="file" class="hidden" accept=".txt" @change="handleFileUpload" />
                    </label>

                    <!-- Progress bar -->
                    <div v-if="uploadProgress > 0" class="mt-5 w-[50%] mx-auto">
                        <div class="bg-gray-200 rounded-full h-2.5">
                            <div class="bg-lime-500 h-2.5 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
                        </div>
                        <p class="text-center mt-2 text-sm text-gray-500">{{ uploadProgress }}% uploaded</p>
                    </div>

                    <!-- Upload and Cancel buttons -->
                    <div class="flex justify-center mt-5 space-x-4">
                        <button v-if="!isUploading" @click="uploadFile" class="bg-green-200 text-green-800 hover:bg-green-400 hover:text-green-900 px-10 py-2 rounded-lg transition-colors">
                            Upload
                        </button>
                        <button v-if="isUploading" @click="cancelUpload" class="bg-red-200 text-red-800 hover:bg-red-400 hover:text-red-900 px-10 py-2 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </Dialog>
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
        <nav class="flex flex-col items-center">
            <div class="w-full flex flex-row border-t justify-between items-center">
                <div>
                    <AccountPopover />
                </div>
                <div class="flex gap-1">
                    <div class="hover:bg-customPurple-200 p-2 rounded-lg">
                        <img src="/icons/help-line.svg" class="w-5 h-5" />
                    </div>
                    <div class="hover:bg-customPurple-200 p-2 rounded-lg">
                        <img src="/icons/settings-outline.svg" class="w-5 h-5" />
                    </div>
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
            <img src="icons/logo.svg" class="h-12" />
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
</div>
</template>

<script>
import AccountPopover from '@/components/AccountPopover.vue';
import Tooltip from '@/components/Tooltip.vue';
import Popover from '@/components/Popover.vue';
import Dialog from '@/components/Dialog.vue';
import axios from 'axios';

export default {
    components: {
        AccountPopover,
        Tooltip,
        Popover,
        Dialog,
    },
    data() {
        return {
            navItems: [{
                    to: '/',
                    label: 'Home',
                    icon: '/icons/house.svg'
                },
                {
                    to: '/books',
                    label: 'Books',
                    icon: '/icons/book.svg'
                },
                {
                    to: '/stats',
                    label: 'Statistics',
                    icon: '/icons/line-chart.svg'
                },
                {
                    to: '/quotes',
                    label: 'Quotes',
                    icon: '/icons/bookmark.svg'
                },
                {
                    to: '/export',
                    label: 'Export',
                    icon: '/icons/export.svg'
                }
            ],
            isOpen: false,
            isMobile: false,
            showBooks: false,
            showImportDialog: false,
            fileName: '',
            uploadProgress: 0,
            cancelTokenSource: null,
        }
    },
    mounted() {
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile);
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth < 900;
        },
        toggleNav() {
            this.isOpen = !this.isOpen;
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.fileName = file.name;
            } else {
                this.fileName = '';
            }
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.fileName = file.name;
            }
        },
        uploadFile() {
            if (this.isUploading) return;

            this.isUploading = true;
            this.uploadProgress = 0;

            this.uploadInterval = setInterval(() => {
                if (this.uploadProgress < 100) {
                    this.uploadProgress += 5;
                } else {
                    this.completeUpload();
                }
            }, 200);
        },
        cancelUpload() {
            clearInterval(this.uploadInterval);
            this.uploadProgress = 0;
            this.isUploading = false;
        },
        completeUpload() {
            clearInterval(this.uploadInterval);
            this.isUploading = false;
            // Here you would typically process the uploaded file
            console.log('Upload complete');
        }
    }
}
</script>

<style>
body {
    font-family: 'Poppins', 'Inter', 'DM Sans', 'Mona Sans', Arial, sans-serif;
    /* font-family: 'Inter', Arial, sans-serif; */
}
</style>
