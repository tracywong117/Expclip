<template>
  <div>
    <div class="page-heading">
      <div><span class="section-kicker">{{ books.length }} TITLES, {{ authorCount }} AUTHORS</span><h1>Your library</h1><p>A home for every book that has given you something worth remembering.</p></div>
      <button class="button-primary" @click="showDialog = true">＋ Add book</button>
    </div>
    <div class="library-tools">
      <div class="search-field"><input v-model="query" placeholder="Search by title or author…"></div>
      <div class="tag-row"><button :class="{active:!selectedTag}" @click="selectedTag=''">All</button><button v-for="tag in tags" :key="tag" :class="{active:selectedTag===tag}" @click="selectedTag=tag">{{ tag }}</button><RatingFilter v-model="selectedRating" /></div>
      <div class="library-selectors">
      <select v-model="bookOrder" aria-label="Sort library books" class="library-sort"><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option><option value="date-desc">First highlight · newest first</option><option value="date-asc">First highlight · oldest first</option></select>
      <div class="view-toggle"><button :class="{active:view==='grid'}" :aria-pressed="view==='grid'" aria-label="Book grid" title="Book grid" @click="view='grid'">▦</button><button :class="{active:view==='list'}" :aria-pressed="view==='list'" aria-label="Library table" title="Library table" @click="view='list'">☷</button></div>
      </div>
    </div>
    <p class="library-count" role="status" aria-live="polite"><strong>{{filteredBooks.length}} {{filteredBooks.length===1?'book':'books'}}</strong><span> · {{selectedTag || 'All books'}}{{selectedRating==='all'?'':selectedRating==='0'?' · Unrated':` · ${selectedRating} ${selectedRating==='1'?'star':'stars'}`}}{{query.trim()?' · matching your search':''}}</span></p>
    <div v-if="filteredBooks.length && view==='list'" class="library-table-wrap" tabindex="0" role="region" aria-label="Library table">
      <table class="library-table"><thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Highlights</th><th scope="col">First highlight</th><th scope="col">Tags</th><th scope="col">Rating</th></tr></thead>
        <tbody><tr v-for="book in filteredBooks" :key="book.id" :class="{'exceptional-book':book.stars===6}">
          <td><router-link :to="`/books/${book.id}`" class="table-title"><span aria-hidden="true">▤</span>{{book.title||'Untitled book'}}</router-link></td>
          <td>{{book.author||'—'}}</td><td class="table-number">{{quoteCount(book.id)}}</td><td class="table-date">{{firstDateLabel(book.id)}}</td>
          <td><BookTagEditor :book="book" /></td>
          <td><StarRating :model-value="book.stars||0" :label="`Rating for ${book.title}`" @update:model-value="booksStore.updateBook(book.id,{stars:$event})" /></td>
        </tr></tbody>
      </table>
    </div>
    <div v-else-if="filteredBooks.length" class="library grid">
      <router-link v-for="(book,index) in filteredBooks" :key="book.id" :to="`/books/${book.id}`" class="book-card">
        <div class="shelf-cover" :style="coverStyle(index)"><img v-if="book.cover" :src="book.cover" :alt="book.title"><div v-else><span>{{ book.title }}</span><small>{{ book.author }}</small></div><button class="favorite" @click.prevent="booksStore.toggleFavorite(book.id)">{{ book.isFavorite?'♥':'♡' }}</button></div>
        <div class="book-meta"><strong>{{ book.title }}</strong><span>{{ book.author }}</span><div><span class="rating">{{ stars(book.stars) }}</span><small>{{ quoteCount(book.id) }} highlights</small></div></div>
      </router-link>
    </div>
    <div v-else class="empty-state"><strong>No books found</strong>Try a different search, or add a new title to your library.</div>
    <AddBookDialog :is-open="showDialog" @close="showDialog=false" @book-added="goToBook" />
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore, useQuotesStore } from '@/stores'
import AddBookDialog from '@/components/AddBookDialog.vue'
import BookTagEditor from '@/components/BookTagEditor.vue'
import StarRating from '@/components/StarRating.vue'
import RatingFilter from '@/components/RatingFilter.vue'
import {ratingText,matchesRating} from '@/utils/bookRating'
import { sortLibraryBooks,firstHighlightDates } from '@/utils/exportOptions'
import { useSettingsStore } from '@/stores/settings'
import { libraryPreferences } from '@/utils/libraryPreferences'
const booksStore=useBooksStore(), quotesStore=useQuotesStore(), router=useRouter()
const {query,selectedTag,selectedRating,view,bookOrder}=libraryPreferences(useSettingsStore())
const showDialog=ref(false)
const firstDates=computed(()=>firstHighlightDates(quotesStore.quotes))
const firstDateLabel=id=>firstDates.value.has(id)?new Date(firstDates.value.get(id)).toLocaleDateString('en',{dateStyle:'medium'}):'—'
const colors=[['#45635c','#d7c8a7'],['#8c4f3d','#e7c58b'],['#495268','#c1b69b'],['#7a7651','#e0d4aa'],['#695269','#d5b4ae']]
const books=computed(()=>booksStore.books)
const authorCount=computed(()=>new Set(books.value.map(b=>b.author)).size)
const tags=computed(()=>[...new Set(books.value.flatMap(b=>b.tags||[]))].slice(0,6))
const filteredBooks=computed(()=>sortLibraryBooks(books.value.filter(b=>matchesRating(b.stars,selectedRating.value)&&(!query.value||`${b.title} ${b.author}`.toLowerCase().includes(query.value.toLowerCase()))&&(!selectedTag.value||(b.tags||[]).includes(selectedTag.value))),quotesStore.quotes,bookOrder.value))
const quoteCount=id=>quotesStore.getQuotesByBook(id).length
const stars=ratingText
const coverStyle=index=>({'--book-color':colors[index%colors.length][0],'--book-accent':colors[index%colors.length][1]})
const goToBook=book=>router.push(`/books/${book.id}`)
</script>
<style scoped>
.library-selectors{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.library-tools>.library-selectors{grid-column:2/-1}@media(max-width:1000px){.library-tools>.search-field,.library-tools>.library-selectors{grid-column:1/-1}.library-selectors{justify-content:flex-start}}
.library-table tbody tr.exceptional-book{background:linear-gradient(105deg,#fff8e6 0%,#fff8e6 35%,#f7e3af 46%,#fffdf4 50%,#f7e3af 54%,#fff8e6 65%,#fff8e6 100%);background-size:300% 100%;animation:book-shimmer 9s ease-in-out infinite}.library-table tbody tr.exceptional-book:hover{background-color:#fff3d5}.exceptional-book .table-title>span{color:#b78023;text-shadow:0 0 10px #e7bb5970}@keyframes book-shimmer{0%,20%{background-position:100% 0}75%,100%{background-position:0% 0}}@media(prefers-reduced-motion:reduce){.library-table tbody tr.exceptional-book{animation:none;background:#fff8e6}}
.library-count{margin:-12px 0 22px;font-size:14px;line-height:1.5;color:var(--muted)}.library-count strong{color:var(--ink);font-weight:600}
.library-sort{padding:9px 10px;border:1px solid var(--line);border-radius:6px;background:var(--paper);font-size:14px;color:var(--ink);max-width:100%}.library-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:8px;background:var(--paper)}.library-table{width:100%;min-width:850px;border-collapse:collapse;font-size:14px;text-align:left}.library-table th{background:#f1eee7;color:var(--muted);font-weight:500;font-size:13px;white-space:nowrap}.library-table th,.library-table td{padding:12px 15px;border-bottom:1px solid var(--line);border-right:1px solid #e6e2d9;vertical-align:middle}.library-table th:last-child,.library-table td:last-child{border-right:0}.library-table tr:last-child td{border-bottom:0}.library-table tbody tr:hover{background:#f5f2eb}.table-title{display:flex;align-items:center;gap:10px;font-weight:600;min-width:210px;max-width:430px;overflow-wrap:anywhere}.table-title>span{font-size:20px;color:var(--muted)}.table-title:hover{color:var(--accent)}.table-number{font-variant-numeric:tabular-nums}.table-date{white-space:nowrap;color:var(--muted)}.table-tags{display:flex;gap:5px;flex-wrap:wrap;min-width:120px}.table-tags span{padding:3px 7px;border-radius:4px;background:#e5e9df;color:#52614d;font-size:12px}.table-favorite{border:0;background:none;color:var(--accent);font-size:21px;width:32px;height:32px}
.library-tools{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;align-items:center;gap:18px;margin-bottom:30px}.tag-row{grid-column:1/-1;grid-row:2;display:flex;gap:6px;overflow-x:auto}.tag-row button,.view-toggle button{border:1px solid var(--line);background:transparent;color:var(--muted);height:34px;border-radius:17px;padding:0 12px;font-size:10px;white-space:nowrap}.tag-row button.active{background:#344941;border-color:#344941;color:white}.view-toggle{display:flex}.view-toggle button{width:35px;padding:0;border-radius:0}.view-toggle button:first-child{border-radius:6px 0 0 6px}.view-toggle button:last-child{border-radius:0 6px 6px 0}.view-toggle button.active{background:#ded8cc;color:var(--ink)}.library.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:35px 25px}.book-card{min-width:0}.shelf-cover{height:270px;position:relative;overflow:hidden;border-radius:3px 7px 7px 3px;background:var(--book-color);box-shadow:0 13px 24px rgba(46,37,27,.16),inset 7px 0 0 rgba(0,0,0,.12);transition:.22s}.book-card:hover .shelf-cover{transform:translateY(-5px);box-shadow:0 18px 32px rgba(46,37,27,.2)}.shelf-cover img{width:100%;height:100%;object-fit:cover}.shelf-cover>div{height:100%;padding:40px 25px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff}.shelf-cover>div:before{content:'';width:28px;height:2px;margin-bottom:22px;background:var(--book-accent)}.shelf-cover span{font:500 20px/1.2 Georgia,serif}.shelf-cover small{margin-top:14px;color:rgba(255,255,255,.7);font-size:10px;text-transform:uppercase;letter-spacing:.08em}.favorite{position:absolute;right:10px;top:10px;width:31px;height:31px;border:0;border-radius:50%;background:rgba(251,250,246,.88);color:var(--accent);font-size:18px}.book-meta{padding-top:15px}.book-meta>strong,.book-meta>span{display:block}.book-meta>strong{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:600 17px Georgia,serif}.book-meta>span{margin-top:5px;color:var(--muted);font-size:11px}.book-meta>div{display:flex;justify-content:space-between;margin-top:10px}.book-meta small{color:#969187;font-size:9px}.rating{color:#d18d31;font-size:10px;letter-spacing:1px}@media(max-width:1100px){.library.grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.library-tools{grid-template-columns:minmax(0,1fr) auto}.library-tools .search-field{grid-column:1/-1}.library-tools .tag-row{grid-row:auto}.tag-row{grid-column:1/-1;grid-row:2}.library.grid{grid-template-columns:repeat(2,1fr);gap:25px 15px}.shelf-cover{height:235px}}@media(max-width:430px){.shelf-cover{height:210px}.shelf-cover>div{padding:25px 14px}.shelf-cover span{font-size:16px}}
</style>
