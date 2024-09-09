<template>
<div id="app" class="flex">
    <!-- Sidebar -->
    <aside class="w-[18vw] border-r hidden md:flex flex-col justify-between fixed h-full">
        <nav class="flex flex-col items-center py-5">
            <img src="/icons/logo.svg" class="w-4/5 mb-5" />
            <ul class="w-full flex flex-col">
                <li class="mb-3">
                    <router-link to="/" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <img src="/icons/home.svg" class="w-7 h-7 mr-3" />
                        <span>Home</span>
                    </router-link>
                </li>
                <li class="mb-3">
                    <router-link to="/books" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <img src="/icons/book.svg" class="w-7 h-7 mr-3" />
                        <span>Books</span>
                    </router-link>
                </li>
                <li class="mb-3">
                    <router-link to="/quotes" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <img src="/icons/bookmark.svg" class="w-7 h-7 mr-3" />
                        <span>Quotes</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/export" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <img src="/icons/export.svg" class="w-7 h-7 mr-3" />
                        <span>Export</span>
                    </router-link>
                </li>
            </ul>
        </nav>
        <nav class="flex flex-col items-center py-5">
            <ul class="w-full flex flex-col">
                <li class="mb-3">
                    <router-link to="/about" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <span>About</span>
                    </router-link>
                </li>
                <li class="mb-3">
                    <router-link to="/terms" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full" active-class="active-link">
                        <span>Terms & Condition</span>
                    </router-link>
                </li>
                <li>
                    <!-- <img src="/icons/user-avatar-filled.svg" class="w-7 h-7 mr-3" /> -->
                    <!-- <span>Account</span> -->
                    <AccountPopover />
                </li>
            </ul>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 md:ml-[19vw] overflow-y-auto">
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

export default {
    components: {
        AccountPopover
    },
    data() {
        return {
            isOpen: false,
            isMobile: false,
            showBooks: false
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
    }
}
</script>

<style>
body {
    font-family: 'Poppins', 'Playfair', 'Switzer', 'Inter', 'DM Sans', 'Mona Sans', Arial, sans-serif;
}

.active-link {
    /* border-left: 4px solid #A9D498; */
    background-color: #f0fdf4;
    /* Light green background for emphasis */
}
</style>
