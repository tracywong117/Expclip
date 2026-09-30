<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <div class="brand-row">
        <router-link to="/" class="brand" @click="mobileOpen = false">
          <img class="brand-mark" :src="logoUrl" alt="" width="48" height="48">
          <span><strong>Expclip</strong><small>Your reading memory</small></span>
        </router-link>
        <button class="icon-button mobile-only" aria-label="Close menu" @click="mobileOpen = false">×</button>
      </div>
      <button class="primary-action" @click="showAddQuoteDialog = true; mobileOpen = false"><span>＋</span> Capture a quote</button>
      <nav class="main-nav" aria-label="Primary navigation">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" @click="mobileOpen = false">
          <span class="nav-icon" v-html="item.icon"></span><span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-card">
        <span class="eyebrow">LIBRARY</span>
        <strong>{{ booksStore.bookCount }} books · {{ quotesStore.quoteCount }} quotes</strong>
        <div class="progress-track"><span :style="{ width: libraryProgress + '%' }"></span></div>
        <small>Your collection lives safely in this browser.</small>
      </div>
      <div class="sidebar-footer">
        <button @click="showImportDialog = true">Import Kindle</button>
        <div class="sidebar-utilities">
        <button class="settings-button" aria-label="Settings" title="Settings" @click="showSettingsDialog = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9.5 3-.5 2a8 8 0 0 0-1.5.9l-2-.6-2.5 4.4 1.5 1.4a8 8 0 0 0 0 1.8L3 14.3l2.5 4.4 2-.6a8 8 0 0 0 1.5.9l.5 2h5l.5-2a8 8 0 0 0 1.5-.9l2 .6 2.5-4.4-1.5-1.4a8 8 0 0 0 0-1.8L21 9.7l-2.5-4.4-2 .6A8 8 0 0 0 15 5l-.5-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button class="settings-button" aria-label="About Expclip" title="About Expclip" @click="showAboutDialog = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6" />
            <circle cx="12" cy="7.5" r=".9" fill="currentColor" stroke="none" />
          </svg>
        </button>
        </div>
      </div>
    </aside>
    <div v-if="mobileOpen" class="mobile-scrim" @click="mobileOpen = false"></div>
    <main class="main-area">
      <header class="topbar">
        <button class="icon-button mobile-only" aria-label="Open menu" @click="mobileOpen = true">☰</button>
        <div class="topbar-title"><span>{{ currentPage.kicker }}</span><strong>{{ currentPage.title }}</strong></div>
      </header>
      <div class="page-wrap"><router-view /></div>
    </main>
    <AddBookDialog :is-open="showAddBookDialog" @close="showAddBookDialog = false" @book-added="handleBookAdded" />
    <AddQuoteDialog :is-open="showAddQuoteDialog" @close="showAddQuoteDialog = false" @quote-added="handleQuoteAdded" />
    <ImportKindleDialog :is-open="showImportDialog" @close="showImportDialog = false" />
    <AboutDialog :is-open="showAboutDialog" @close="showAboutDialog = false" />
    <SettingsDialog :show="showSettingsDialog" @update:show="showSettingsDialog = $event" />
  </div>
</template>

<script setup>
import logoUrl from '@/assets/expclip-logo-orange.png'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore, useQuotesStore } from '@/stores'
import AddBookDialog from '@/components/AddBookDialog.vue'
import AddQuoteDialog from '@/components/AddQuoteDialog.vue'
import ImportKindleDialog from '@/components/ImportKindleDialog.vue'
import AboutDialog from '@/components/AboutDialog.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()
const quotesStore = useQuotesStore()
const mobileOpen = ref(false)
const showAddBookDialog = ref(false)
const showAddQuoteDialog = ref(false)
const showImportDialog = ref(false)
const showAboutDialog = ref(false)
const showSettingsDialog = ref(false)
const icons = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  quotes: '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V6H5v7h3zm10 0h3l2-4V6h-6v7h3z"/></svg>',
  books: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z"/></svg>',
  export: '<svg viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 17v3h14v-3"/></svg>'
}
const navItems = [
  { to: '/', label: 'Today', icon: icons.home }, { to: '/quotes', label: 'Highlights', icon: icons.quotes },
  { to: '/books', label: 'Library', icon: icons.books }, { to: '/stats', label: 'Insights', icon: icons.stats },
  { to: '/export', label: 'Export', icon: icons.export }
]
const pageMeta = {
  Home: { kicker: 'READING STUDIO', title: 'Today' }, Quotes: { kicker: 'YOUR COLLECTION', title: 'Highlights' },
  Books: { kicker: 'YOUR COLLECTION', title: 'Library' }, BookInstance: { kicker: 'BOOK DETAILS', title: 'Reading notes' },
  Stats: { kicker: 'YOUR READING', title: 'Insights' }, Export: { kicker: 'TAKE IT WITH YOU', title: 'Export' }
}
const currentPage = computed(() => pageMeta[route.name] || pageMeta.Home)
const libraryProgress = computed(() => Math.min(100, Math.max(8, booksStore.bookCount * 8)))
const handleBookAdded = book => router.push(`/books/${book.id}`)
const handleQuoteAdded = () => router.push('/quotes')
</script>
