<template>
  <div>
    <div class="page-heading"><div><span class="section-kicker">{{ filtered.length }} SAVED PASSAGES</span><h1>Highlights</h1><p>The words you paused for—collected, searchable, and ready to find you again.</p></div><button class="button-primary" @click="showDialog=true">＋ New highlight</button></div>
    <div class="quote-layout">
      <aside class="filters panel">
        <div><span class="filter-label">FIND A PASSAGE</span><div class="search-field"><input v-model="query" placeholder="Search highlights…"></div></div>
        <div><span class="filter-label">SHOW</span><button :class="{active:mode==='all'}" @click="mode='all'">All highlights <span>{{ quotesStore.quoteCount }}</span></button><button :class="{active:mode==='favorites'}" @click="mode='favorites'">Favorites <span>{{ quotesStore.favoriteQuotes.length }}</span></button></div>
        <div class="tag-filter"><span class="filter-label">TAG</span><TagFilter v-model="selectedTag" :tags="tags" :total="quotesStore.quoteCount" /></div>
        <div class="book-filter"><span class="filter-label">BOOK</span><BookPicker v-model="bookId" :books="booksWithQuotes" :total="quotesStore.quoteCount" /><p v-if="bookId">Showing highlights from the selected book.</p></div>
        <button class="clear" @click="clearFilters">Clear filters</button>
      </aside>
      <section class="quote-feed">
        <div class="feed-tools"><span>Sorted by date added</span><select v-model="sort"><option value="new">Newest first</option><option value="old">Oldest first</option></select></div>
        <QuoteContent v-for="quote in filtered" :key="quote.id" :quote="quote" />
        <div v-if="!filtered.length" class="empty-state"><strong>No highlights here yet</strong>Adjust the filters or capture a passage you want to remember.</div>
      </section>
    </div>
    <AddQuoteDialog :is-open="showDialog" @close="showDialog=false" />
  </div>
</template>
<script setup>
import { computed,ref } from 'vue'
import { useBooksStore,useQuotesStore } from '@/stores'
import QuoteContent from '@/components/QuoteContent.vue'
import AddQuoteDialog from '@/components/AddQuoteDialog.vue'
import BookPicker from '@/components/BookPicker.vue'
import {filterHighlights} from '@/utils/highlightFilters'
import TagFilter from '@/components/TagFilter.vue'
const booksStore=useBooksStore(),quotesStore=useQuotesStore()
const query=ref(''),mode=ref('all'),bookId=ref(''),sort=ref('new'),showDialog=ref(false)
const selectedTag=ref('')
const tags=computed(()=>{
  const counts=new Map()
  quotesStore.quotes.forEach(quote=>new Set(quote.tags||[]).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)))
  return [...counts].map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name))
})
const booksWithQuotes=computed(()=>booksStore.books.map(book=>({...book,count:quotesStore.getQuotesByBook(book.id).length})).filter(book=>book.count))
const filtered=computed(()=>filterHighlights(quotesStore.quotes,{query:query.value,favoritesOnly:mode.value==='favorites',bookId:bookId.value,tag:selectedTag.value}).sort((a,b)=>(sort.value==='new'?-1:1)*(new Date(a.dateHighlighted||a.dateAdded)-new Date(b.dateHighlighted||b.dateAdded))))
const clearFilters=()=>{query.value='';mode.value='all';bookId.value='';selectedTag.value=''}
</script>
<style scoped>
.note-filter label{display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer}.note-filter input{width:17px;height:17px;accent-color:var(--olive)}.note-filter small{margin-left:auto;color:var(--muted);font-size:13px}.tag-filter select{width:100%;min-height:42px;padding:9px 10px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink);font-size:14px}.tag-filter p{font-size:12px;line-height:1.5;color:var(--muted)}
.quote-layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:30px}.filters{align-self:start;padding:23px;position:sticky;top:100px}.filters>div+div{margin-top:25px;padding-top:21px;border-top:1px solid var(--line)}.filter-label{display:block;margin-bottom:10px;color:#69665f;font-size:11px;font-weight:800;letter-spacing:.14em}.filters button{width:100%;padding:10px;border:0;border-radius:5px;display:flex;justify-content:space-between;background:transparent;color:#4e4b45;text-align:left;font-size:14px}.filters button:hover,.filters button.active{background:#ece7dc;color:var(--ink)}.filters button span{color:#77736b}.book-filter select{width:100%;height:46px;padding:0 34px 0 12px;border:1px solid #cfc9bd;border-radius:7px;background:#fffdf8;color:var(--ink);font-size:14px;outline:none}.book-filter select:focus{border-color:var(--olive);box-shadow:0 0 0 3px rgba(89,107,86,.1)}.book-filter p{margin:10px 2px 0;color:#77736b;font-size:12px;line-height:1.45}.filters .clear{margin-top:24px;padding-top:15px;border-top:1px solid var(--line);border-radius:0;color:var(--accent);font-size:13px;font-weight:700}.feed-tools{height:43px;margin-bottom:12px;padding:0 4px;display:flex;align-items:start;justify-content:space-between;color:#77736b;font-size:12px}.feed-tools select{border:0;background:transparent;color:#4e4b45;outline:none}.quote-feed{min-width:0}.quote-feed>:deep(.quote-card)+:deep(.quote-card){margin-top:24px}@media(max-width:760px){.quote-layout{grid-template-columns:1fr}.filters{position:static;display:grid;grid-template-columns:1fr 1fr;gap:18px}.filters>div+div{margin:0;padding:0;border:0}.filters>div:nth-child(3){grid-column:1/-1}.filters .clear{margin:0;padding:9px;border:0}.feed-tools{margin-top:8px}}@media(max-width:480px){.filters{grid-template-columns:1fr}.filters>div:nth-child(3){grid-column:auto}}
</style>
