<template>
  <div v-if="book">
    <router-link to="/books" class="back-link">← Back to library</router-link>
    <p v-if="mergeMessage" class="merge-notice" role="status">{{ mergeMessage }}</p>
    <section class="book-hero">
      <div class="detail-cover"><img v-if="book.cover" :src="book.cover" :alt="book.title"><div v-else><small>EXPCLIP EDITION</small><span>{{ book.title }}</span><i></i><em>{{ book.author }}</em></div></div>
      <div class="book-info">
        <span class="section-kicker">{{ (book.tags||[]).join(' · ') || 'IN YOUR LIBRARY' }}</span>
        <template v-if="!editing">
          <h1>{{ book.title }}</h1><h2>{{ book.author }}</h2>
          <StarRating :model-value="book.stars||0" show-value @update:model-value="updateStars" />
          <div class="book-stats"><div><strong>{{ bookQuotes.length }}</strong><span>Highlights</span></div><div><strong>{{ favorites.length }}</strong><span>Favorites</span></div><div><strong>{{ addedYear }}</strong><span>Added</span></div></div>
          <div class="hero-actions"><button class="button-primary" @click="showQuoteDialog=true">＋ Add highlight</button><button class="button-secondary" @click="startEdit">Edit details</button><button class="heart-button" @click="booksStore.toggleFavorite(book.id)">{{book.isFavorite?'♥':'♡'}}</button></div>
        </template>
        <form v-else class="edit-form" @submit.prevent="saveEdit"><label>Title<input v-model="form.title" required></label><label>Author<input v-model="form.author"></label><label>Cover image URL<input v-model="form.cover"></label><label>Tags<input v-model="form.tags" placeholder="history, design, philosophy"></label><p v-if="mergeTarget" class="merge-notice">A book with this exact title and author already exists. Saving will merge this book into it, keeping all highlights and notes.</p><div><button class="delete-book-trigger" type="button" @click="showDeleteBook=true">Delete book</button><button type="button" class="button-secondary" @click="editing=false">Cancel</button><button class="button-primary">{{ mergeTarget ? 'Save & merge books' : 'Save details' }}</button></div></form>
      </div>
    </section>
    <section class="book-highlights">
      <div class="highlights-header"><div><span class="section-kicker">FROM THIS BOOK</span><h2>Highlights & notes</h2></div><div class="tabs"><button :class="{active:filter==='all'}" @click="filter='all'">All {{bookQuotes.length}}</button><button :class="{active:filter==='favorites'}" @click="filter='favorites'">Favorites {{favorites.length}}</button></div></div>
      <div class="highlight-sort"><label>Sort highlights<select v-model="highlightSort"><option value="time">Highlight date</option><option value="location">Location</option></select></label><label>Order<select v-model="highlightDirection"><option value="asc">{{highlightSort==='time'?'Oldest first':'Lowest location first'}}</option><option value="desc">{{highlightSort==='time'?'Newest first':'Highest location first'}}</option></select></label></div>
      <div class="highlight-list"><QuoteContent v-for="quote in displayed" :key="quote.id" :quote="quote"/><div v-if="!displayed.length" class="empty-state"><strong>No highlights to show</strong>Add a highlight or check your favorites filter.</div></div>
    </section>
    <AddQuoteDialog :is-open="showQuoteDialog" :preselected-book-id="book.id" @close="showQuoteDialog=false" />
    <Dialog :show="showDeleteBook" @update:show="showDeleteBook=$event">
      <div class="delete-book-confirm" @keydown.esc.stop="showDeleteBook=false">
        <span class="section-kicker">DELETE BOOK</span>
        <h2>Delete this book and its highlights?</h2>
        <p><strong>{{book.title}}</strong> will be permanently deleted along with <strong>{{bookQuotes.length}} {{bookQuotes.length===1?'highlight':'highlights'}}</strong>, including their notes and tags. Related book notes will also be removed.</p>
        <p>This cannot be undone. Export a backup first if you want to keep a copy.</p>
        <div class="delete-book-actions"><button class="button-secondary" @click="showDeleteBook=false">Keep book</button><button class="delete-book-confirm-button" @click="confirmDeleteBook">Delete book & highlights</button></div>
      </div>
    </Dialog>
  </div>
  <div v-else class="empty-state"><strong>Book not found</strong><router-link to="/books">Return to your library</router-link></div>
</template>
<script setup>
import { computed,ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useBooksStore,useQuotesStore } from '@/stores'
import QuoteContent from '@/components/QuoteContent.vue'
import AddQuoteDialog from '@/components/AddQuoteDialog.vue'
import Dialog from '@/components/Dialog.vue'
import StarRating from '@/components/StarRating.vue'
import { selectExportQuotes } from '@/utils/exportOptions'
const route=useRoute(),router=useRouter(),booksStore=useBooksStore(),quotesStore=useQuotesStore()
const mergeMessage=ref('')
const showDeleteBook=ref(false)
const confirmDeleteBook=async()=>{
  if(!showDeleteBook.value||!book.value)return
  const id=book.value.id
  showDeleteBook.value=false
  if(booksStore.deleteBook(id))await router.replace('/books')
}
const mergeTarget=computed(()=>booksStore.books.find(item=>item.id!==book.value?.id&&item.title===form.value.title&&item.author===form.value.author))
const editing=ref(false),filter=ref('all'),showQuoteDialog=ref(false),form=ref({})
const book=computed(()=>booksStore.getBookById(route.params.id))
const bookQuotes=computed(()=>book.value?quotesStore.getQuotesByBook(book.value.id):[])
const highlightSort=ref('time'),highlightDirection=ref('asc')
const favorites=computed(()=>bookQuotes.value.filter(q=>q.isFavorite))
const displayed=computed(()=>selectExportQuotes(bookQuotes.value,booksStore.books,{favoritesOnly:filter.value==='favorites',sortBy:highlightSort.value,direction:highlightDirection.value}))
const addedYear=computed(()=>book.value?.dateAdded?new Date(book.value.dateAdded).getFullYear():'—')
const updateStars=value=>booksStore.updateBook(book.value.id,{stars:value})
const startEdit=()=>{mergeMessage.value='';form.value={title:book.value.title,author:book.value.author,cover:book.value.cover||'',tags:(book.value.tags||[]).join(', ')};editing.value=true}
const saveEdit=async()=>{const originalId=book.value.id;const saved=booksStore.updateBook(originalId,{title:form.value.title,author:form.value.author,cover:form.value.cover,tags:form.value.tags.split(',').map(t=>t.trim()).filter(Boolean)});editing.value=false;if(saved&&saved.id!==originalId){await router.replace({path:`/books/${saved.id}`});mergeMessage.value='Books merged. All highlights and notes have been kept.'}}
</script>
<style scoped>
.delete-book-trigger{margin-right:auto;align-self:center;padding:8px 0;border:0;background:none;color:#a94532;font-size:14px}.delete-book-trigger:hover{text-decoration:underline}.delete-book-confirm h2{margin:8px 0 18px;font:500 28px/1.2 Georgia,serif}.delete-book-confirm p{font-size:15px;line-height:1.65;overflow-wrap:anywhere;color:var(--muted)}.delete-book-confirm strong{color:var(--ink)}.delete-book-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px;margin-top:24px}.delete-book-confirm-button{padding:11px 16px;border:1px solid #a94532;border-radius:7px;background:#a94532;color:white;font-size:14px;font-weight:600}
.highlight-sort{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:20px}.highlight-sort label{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)}.highlight-sort select{padding:9px 12px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--ink);font-size:14px}
.merge-notice{grid-column:1/-1;padding:12px 16px;border-radius:8px;background:#e5ecdf;color:var(--ink);font-size:14px;line-height:1.5}
.back-link{display:inline-block;margin-bottom:27px;color:var(--muted);font-size:11px}.back-link:hover{color:var(--accent)}.book-hero{display:grid;grid-template-columns:235px minmax(0,1fr);gap:53px;align-items:center}.detail-cover{align-self:start;height:345px;overflow:hidden;border-radius:4px 9px 9px 4px;background:#3d584f;box-shadow:0 22px 40px rgba(42,36,27,.22),inset 9px 0 0 rgba(0,0,0,.15)}.detail-cover img{width:100%;height:100%;object-fit:cover}.detail-cover>div{height:100%;padding:35px 27px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;color:#f7f0df}.detail-cover small{font-size:7px;letter-spacing:.18em}.detail-cover span{margin-top:55px;font:500 25px/1.2 Georgia,serif}.detail-cover i{width:28px;height:2px;margin:22px 0;background:#d7b56e}.detail-cover em{font:normal 9px sans-serif;letter-spacing:.1em;text-transform:uppercase}.book-info h1{max-width:700px;margin:0;font:500 clamp(36px,5vw,58px)/1.02 Georgia,serif;letter-spacing:-.035em}.book-info h2{margin:12px 0 22px;color:var(--muted);font:400 17px Georgia,serif}.stars{display:flex;align-items:center;gap:1px}.stars button{padding:0;border:0;background:transparent;color:#d49235;font-size:17px}.stars small{margin-left:8px;color:var(--muted);font-size:9px}.book-stats{margin:29px 0;display:flex}.book-stats div{min-width:110px;padding:0 25px;border-left:1px solid var(--line)}.book-stats div:first-child{padding-left:0;border:0}.book-stats strong,.book-stats span{display:block}.book-stats strong{font:500 25px Georgia,serif}.book-stats span{margin-top:4px;color:var(--muted);font-size:9px;text-transform:uppercase}.hero-actions{display:flex;gap:8px}.heart-button{width:40px;border:1px solid var(--line);border-radius:7px;background:transparent;color:var(--accent);font-size:18px}.book-highlights{margin-top:65px}.highlights-header{display:flex;align-items:end;justify-content:space-between;margin-bottom:19px}.highlights-header h2{margin:0;font:500 27px Georgia,serif}.tabs{display:flex;gap:5px}.tabs button{padding:7px 11px;border:0;border-radius:15px;background:transparent;color:var(--muted);font-size:10px}.tabs button.active{background:#ded7ca;color:var(--ink)}.highlight-list{display:grid;gap:13px}.edit-form{max-width:620px;display:grid;grid-template-columns:1fr 1fr;gap:13px}.edit-form label{color:var(--muted);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.edit-form label:first-child,.edit-form label:nth-child(3),.edit-form label:nth-child(4),.edit-form>div{grid-column:1/-1}.edit-form input{width:100%;height:39px;margin-top:6px;padding:0 11px;border:1px solid var(--line);border-radius:6px;background:var(--paper);outline:none;text-transform:none;letter-spacing:0;color:var(--ink)}.edit-form>div{display:flex;justify-content:flex-end;gap:8px}@media(max-width:700px){.book-hero{grid-template-columns:120px 1fr;gap:25px;align-items:start}.detail-cover{height:180px}.detail-cover>div{padding:15px 10px}.detail-cover span{margin-top:25px;font-size:14px}.book-info h1{font-size:31px}.book-stats{margin:20px 0}.book-stats div{min-width:0;padding:0 13px}.hero-actions{flex-wrap:wrap}.book-highlights{margin-top:45px}.highlights-header{align-items:flex-start;flex-direction:column;gap:15px}}@media(max-width:480px){.book-hero{grid-template-columns:1fr}.detail-cover{width:145px;height:215px}.edit-form{grid-template-columns:1fr}.edit-form label{grid-column:1/-1}.highlights-header h2{font-size:24px}}
</style>
