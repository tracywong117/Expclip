<template>
  <div class="home-page">
    <section class="welcome-row">
      <div>
        <span class="section-kicker">{{ todayLabel }}</span>
        <h1>Good {{ greeting }}, reader.</h1>
        <p>Return to an idea worth keeping, or add something new to your reading memory.</p>
      </div>
      <button class="button-secondary" @click="showBookDialog = true">＋ Add a book</button>
    </section>

    <section class="hero-grid">
      <article class="daily-quote panel">
        <div class="quote-top"><span>QUOTE OF THE DAY</span><button @click="toggleFavorite">{{ dailyQuote?.isFavorite ? '♥' : '♡' }}</button></div>
        <template v-if="dailyQuote">
          <blockquote>{{ dailyQuote.text }}</blockquote>
          <div class="quote-source">
            <span class="mini-cover">{{ initials(dailyBook?.title) }}</span>
            <div><strong>{{ dailyBook?.title || 'Unknown book' }}</strong><small>{{ dailyBook?.author || 'Unknown author' }}</small></div>
            <router-link to="/quotes">View highlight →</router-link>
          </div>
        </template>
        <template v-else>
          <blockquote>We read to know we are not alone.</blockquote>
          <div class="quote-source"><span class="mini-cover">CS</span><div><strong>Your first highlight is waiting</strong><small>Capture it when it finds you.</small></div></div>
        </template>
      </article>

      <aside class="snapshot panel">
        <span class="section-kicker">AT A GLANCE</span>
        <h2>Your reading memory</h2>
        <div class="snapshot-stats">
          <div><strong>{{ booksStore.bookCount }}</strong><span>Books</span></div>
          <div><strong>{{ quotesStore.quoteCount }}</strong><span>Highlights</span></div>
          <div><strong>{{ quotesStore.favoriteQuotes.length }}</strong><span>Favorites</span></div>
        </div>
        <router-link to="/stats">Explore your insights <span>↗</span></router-link>
      </aside>
    </section>

    <section class="recent-section">
      <div class="section-title"><div><span class="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Recently opened</h2></div><router-link to="/books">View library →</router-link></div>
      <div v-if="recentBooks.length" class="book-strip">
        <router-link v-for="(book, index) in recentBooks" :key="book.id" :to="`/books/${book.id}`" class="recent-book panel">
          <div class="book-cover" :style="coverStyle(book, index)">
            <img v-if="book.cover" :src="book.cover" :alt="book.title" />
            <span v-else>{{ initials(book.title) }}</span>
          </div>
          <div class="book-copy"><strong>{{ book.title }}</strong><span>{{ book.author }}</span><small>{{ quoteCount(book.id) }} highlights · {{ relativeDate(book.lastModified) }}</small></div>
          <span class="arrow">→</span>
        </router-link>
      </div>
      <div v-else class="empty-state"><strong>Build your reading shelf</strong>Add a book or import your Kindle highlights to begin.</div>
    </section>

    <section class="prompt panel">
      <span class="prompt-icon">✦</span>
      <div><span class="section-kicker">A QUESTION TO CARRY</span><h2>What idea from your recent reading has stayed with you?</h2><p>Save a line now. Your future self will thank you.</p></div>
      <button class="button-primary" @click="showQuoteDialog = true">Capture a thought</button>
    </section>

    <AddBookDialog :is-open="showBookDialog" @close="showBookDialog = false" @book-added="goToBook" />
    <AddQuoteDialog :is-open="showQuoteDialog" @close="showQuoteDialog = false" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore, useQuotesStore } from '@/stores'
import AddBookDialog from '@/components/AddBookDialog.vue'
import AddQuoteDialog from '@/components/AddQuoteDialog.vue'

const booksStore = useBooksStore()
const quotesStore = useQuotesStore()
const router = useRouter()
const showBookDialog = ref(false)
const showQuoteDialog = ref(false)
const palettes = [['#d4a36f','#784938'],['#7e9c91','#314b46'],['#c9a7a2','#704640'],['#9a9f79','#4d563a']]
const todayLabel = new Intl.DateTimeFormat('en', { weekday:'long', month:'long', day:'numeric' }).format(new Date()).toUpperCase()
const greeting = computed(() => new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening')
const recentBooks = computed(() => [...booksStore.books].sort((a,b) => new Date(b.lastModified)-new Date(a.lastModified)).slice(0,3))
const dailyQuote = computed(() => quotesStore.quotes.length ? quotesStore.quotes[new Date().getDate() % quotesStore.quotes.length] : null)
const dailyBook = computed(() => dailyQuote.value ? booksStore.getBookById(dailyQuote.value.bookId) : null)
const initials = value => (value || '?').split(/\s+/).slice(0,2).map(word => word[0]).join('').toUpperCase()
const quoteCount = id => quotesStore.getQuotesByBook(id).length
const relativeDate = value => { const days = Math.floor((Date.now()-new Date(value).getTime())/86400000); return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago` }
const coverStyle = (book,index) => book.cover ? {} : { '--cover': palettes[index%palettes.length][0], '--cover-dark':palettes[index%palettes.length][1] }
const toggleFavorite = () => dailyQuote.value && quotesStore.toggleFavorite(dailyQuote.value.id)
const goToBook = book => router.push(`/books/${book.id}`)
</script>

<style scoped>
.welcome-row{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:34px}.welcome-row h1{margin:0;font:500 clamp(36px,5vw,55px)/1 Georgia,serif;letter-spacing:-.035em}.welcome-row p{margin:12px 0 0;color:var(--muted);font-size:14px}.hero-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(240px,.75fr);gap:18px}.daily-quote{min-height:310px;padding:32px 35px;display:flex;flex-direction:column;background:linear-gradient(135deg,#fbfaf6 0%,#f8f3e9 100%)}.quote-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:nowrap;gap:12px;color:var(--accent);font-size:10px;font-weight:800;letter-spacing:.16em}.quote-top span{white-space:nowrap}.quote-top button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;width:32px;height:32px;padding:0;line-height:1;border:0;background:transparent;color:var(--accent);font-size:23px}.daily-quote blockquote{max-width:750px;margin:auto 0;padding:28px 0;font:400 clamp(20px,2vw,26px)/1.5 Georgia,serif;letter-spacing:-.02em}.quote-source{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:19px}.mini-cover{width:33px;height:42px;display:grid;place-items:center;border-radius:2px;background:#364a45;color:white;font:600 11px Georgia,serif}.quote-source strong,.quote-source small{display:block}.quote-source strong{font:600 13px Georgia,serif}.quote-source small{margin-top:3px;color:var(--muted);font-size:10px}.quote-source a{margin-left:auto;color:var(--accent);font-size:11px;font-weight:700}.snapshot{padding:31px 28px;background:#253833;color:#f7f3e9}.snapshot .section-kicker{color:#e6ad55}.snapshot h2{margin:0;font:500 24px Georgia,serif}.snapshot-stats{margin:31px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.snapshot-stats div{border-left:1px solid #52635e;padding-left:12px}.snapshot-stats strong,.snapshot-stats span{display:block}.snapshot-stats strong{font:500 29px Georgia,serif}.snapshot-stats span{margin-top:4px;color:#aebbb6;font-size:9px;text-transform:uppercase}.snapshot>a{display:block;padding-top:17px;border-top:1px solid #495b55;color:#d8dfdb;font-size:11px}.snapshot>a span{float:right}.recent-section{margin-top:45px}.section-title{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}.section-title h2{margin:0;font:500 27px Georgia,serif}.section-title>a{color:var(--accent);font-size:11px;font-weight:700}.book-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.recent-book{min-height:127px;padding:15px;display:flex;align-items:center;gap:15px;transition:.2s}.recent-book:hover{transform:translateY(-2px);box-shadow:0 13px 35px rgba(38,32,22,.09)}.book-cover{width:66px;height:96px;flex:0 0 auto;display:grid;place-items:center;overflow:hidden;border-radius:3px;background:var(--cover,#8e9a7a);border-left:5px solid var(--cover-dark,#42503a);box-shadow:3px 5px 9px rgba(0,0,0,.14);color:white;font:600 15px Georgia,serif}.book-cover img{width:100%;height:100%;object-fit:cover}.book-copy{min-width:0}.book-copy strong,.book-copy span,.book-copy small{display:block}.book-copy strong{overflow:hidden;font:600 16px/1.2 Georgia,serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.book-copy span{margin-top:6px;color:var(--muted);font-size:10px}.book-copy small{margin-top:17px;color:#99958b;font-size:9px}.arrow{margin-left:auto;color:#969187}.prompt{margin-top:45px;padding:26px 30px;display:flex;align-items:center;gap:22px;background:#ece5d7}.prompt-icon{width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:#d9c7a7;color:#6b5434;font-size:22px}.prompt h2{margin:0;font:500 21px Georgia,serif}.prompt p{margin:5px 0 0;color:var(--muted);font-size:11px}.prompt button{margin-left:auto;white-space:nowrap}@media(max-width:1020px){.hero-grid{grid-template-columns:1fr}.book-strip{grid-template-columns:1fr}.recent-book{min-height:120px}}@media(max-width:560px){.welcome-row{align-items:flex-start;flex-direction:column;gap:20px}.daily-quote{padding:25px 22px}.daily-quote blockquote{font-size:20px}.quote-source a{display:none}.prompt{align-items:flex-start;flex-wrap:wrap}.prompt button{margin-left:72px}.snapshot-stats strong{font-size:25px}}
</style>
