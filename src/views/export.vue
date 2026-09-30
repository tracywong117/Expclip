<template>
  <div>
    <div class="page-heading"><div><span class="section-kicker">YOUR WORDS, YOUR WAY</span><h1>Take your highlights with you</h1><p>Export a clean copy of your collection for writing, study, or safekeeping.</p></div></div>
    <div class="export-grid">
      <section class="panel export-main">
        <span class="section-kicker">CHOOSE A FORMAT</span><h2>What would you like to create?</h2>
        <div class="format-grid">
          <button v-for="item in formats" :key="item.id" :class="{active:format===item.id,disabled:item.disabled}" @click="!item.disabled&&(format=item.id)"><span>{{item.icon}}</span><strong>{{item.name}}</strong><small>{{item.copy}}</small><em v-if="item.disabled">Soon</em></button>
        </div>
        <section class="export-customization">
          <h3>Choose your books</h3>
          <div class="scope-controls"><label><input v-model="bookScope" type="radio" value="all"> Every book</label><label><input v-model="bookScope" type="radio" value="selected"> Selected books</label></div>
          <div v-if="bookScope==='selected'" class="book-selection">
            <input v-model="bookSearch" type="search" placeholder="Search title or author…" aria-label="Search books to export">
            <div class="selection-tools"><span>{{selectedBookIds.length}} selected</span><button type="button" @click="selectMatchingBooks">Select matching</button><button type="button" @click="selectedBookIds=[]">Clear</button></div>
            <div class="book-checklist"><label v-for="book in matchingBooks" :key="book.id"><input v-model="selectedBookIds" type="checkbox" :value="book.id"><span><strong>{{book.title || 'Untitled book'}}</strong><small>{{book.author || 'Unknown author'}}</small></span></label><p v-if="!matchingBooks.length">No matching books.</p></div>
          </div>
          <h3>Arrange your highlights</h3>
          <p class="option-hint">Highlights always stay grouped by book. Sorting applies within each book; missing dates or locations go last.</p>
          <div class="custom-fields">
            <label>Book order<select v-model="bookOrder"><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option><option value="date-desc">First highlight · newest first</option><option value="library">Library order</option></select></label>
            <label>Sort highlights by<select v-model="sortBy"><option value="time">Highlight date</option><option value="location">Location</option></select></label>
            <label>Direction<select v-model="direction"><option value="asc">{{sortBy==='time'?'Oldest first':'Lowest location first'}}</option><option value="desc">{{sortBy==='time'?'Newest first':'Highest location first'}}</option></select></label>
          </div>
          <h3>Filter by highlight date</h3>
          <div class="custom-fields"><label>From<input v-model="dateFrom" type="date" :max="dateTo||undefined"></label><label>Through<input v-model="dateTo" type="date" :min="dateFrom||undefined"></label></div>
          <p class="option-hint">Leave blank for all dates. Uses the saved date when the highlight date is missing.</p>
          <p v-if="invalidDateRange" role="alert" class="export-error">The end date must be on or after the start date.</p>
        </section>
        <div class="options"><label><span>Include book details and metadata</span><input v-model="includeDetails" type="checkbox"></label><label><span>Favorites only</span><input v-model="favoritesOnly" type="checkbox"></label></div>
        <p v-if="!exportable.length&&!invalidDateRange" role="status" class="option-hint">No highlights match your selection. Choose books or adjust the filters.</p>
        <p v-if="exportError" role="alert" class="export-error">{{exportError}}</p>
        <button class="button-primary export-button" :disabled="!exportable.length || exporting" @click="download">{{exporting ? 'Preparing export…' : 'Download '+format.toUpperCase()+' · '+exportable.length+' highlights'}}</button>
      </section>
      <aside class="panel summary"><span class="section-kicker">EXPORT SUMMARY</span><h2>Ready when you are</h2><div><strong>{{exportable.length}}</strong><span>highlights</span></div><div><strong>{{bookCount}}</strong><span>books represented</span></div><p>Your export is generated locally. Nothing is uploaded or shared.</p></aside>
    </div>
  </div>
</template>
<script setup>
import { computed,ref } from 'vue'
import FileSaver from 'file-saver'
import { useBooksStore,useQuotesStore } from '@/stores'
import { selectExportQuotes,serializeTextExport } from '@/utils/exportOptions'
const booksStore=useBooksStore(),quotesStore=useQuotesStore()
const format=ref('txt'),includeDetails=ref(true),favoritesOnly=ref(false)
const exporting=ref(false),exportError=ref('')
const formats=[{id:'txt',icon:'T',name:'Plain text',copy:'Simple and universal'},{id:'csv',icon:'▦',name:'Spreadsheet',copy:'Organized for analysis'},{id:'pdf',icon:'P',name:'PDF document',copy:'Designed and paginated'},{id:'docx',icon:'W',name:'Word document',copy:'Ready for writing'}]
const bookScope=ref('all'),selectedBookIds=ref([]),bookSearch=ref('')
const sortBy=ref('time'),direction=ref('asc'),bookOrder=ref('title-asc'),dateFrom=ref(''),dateTo=ref('')
const invalidDateRange=computed(()=>!!(dateFrom.value&&dateTo.value&&dateFrom.value>dateTo.value))
const matchingBooks=computed(()=>booksStore.books.filter(book=>`${book.title} ${book.author}`.toLocaleLowerCase().includes(bookSearch.value.trim().toLocaleLowerCase())).slice().sort((a,b)=>(a.title||'').localeCompare(b.title||'')))
const selectMatchingBooks=()=>{selectedBookIds.value=[...new Set([...selectedBookIds.value,...matchingBooks.value.map(book=>book.id)])]}
const exportable=computed(()=>invalidDateRange.value?[]:selectExportQuotes(quotesStore.quotes,booksStore.books,{
  bookIds:bookScope.value==='all'?null:selectedBookIds.value,favoritesOnly:favoritesOnly.value,
  sortBy:sortBy.value,direction:direction.value,bookOrder:bookOrder.value,dateFrom:dateFrom.value,dateTo:dateTo.value,
}))
const bookCount=computed(()=>new Set(exportable.value.map(q=>q.bookId)).size)
const download=async()=>{
  if(exporting.value||!exportable.value.length)return
  exportError.value=''
  const chosenFormat=format.value
  const options={quotes:exportable.value.map(q=>({...q})),books:booksStore.books.map(b=>({...b})),includeDetails:includeDetails.value}
  exporting.value=true
  try{
    if(chosenFormat==='docx'){
      const {downloadHighlightsWord}=await import('@/utils/wordExporter')
      await downloadHighlightsWord(options)
    }else if(chosenFormat==='pdf'){
      const {downloadHighlightsPdf}=await import('@/utils/pdfExporter')
      await downloadHighlightsPdf(options)
    }else{
      const content=serializeTextExport(options.quotes,options.books,{format:chosenFormat,includeDetails:options.includeDetails})
      const type=chosenFormat==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'
      FileSaver.saveAs(new Blob([content],{type}),`expclip-highlights.${chosenFormat}`)
    }
  }catch(error){exportError.value=error.message||'Export failed. Please try again.'}
  finally{exporting.value=false}
}
</script>
<style scoped>
.export-customization{margin-top:28px}.export-customization h3{margin:24px 0 12px;font:600 19px Georgia,serif}.scope-controls,.selection-tools{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.scope-controls label{display:flex;gap:8px;align-items:center;font-size:15px}.export-customization input[type=checkbox],.export-customization input[type=radio]{accent-color:var(--olive);width:18px;height:18px;flex:none}.book-selection{margin-top:14px;border:1px solid var(--line);border-radius:8px;padding:14px}.export-customization input:not([type=checkbox]):not([type=radio]),.custom-fields select{width:100%;min-height:42px;padding:9px 11px;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--ink);font-size:15px}.selection-tools{margin:12px 0;gap:12px;font-size:14px}.selection-tools button{padding:6px 8px;background:transparent;border:1px solid var(--line);border-radius:5px;font-size:14px}.book-checklist{max-height:240px;overflow:auto}.book-checklist label{display:flex;gap:12px;padding:12px 4px;align-items:center;border-top:1px solid var(--line)}.book-checklist strong,.book-checklist small{display:block;overflow-wrap:anywhere}.book-checklist strong{font-size:15px}.book-checklist small{font-size:13px;margin-top:4px;color:var(--muted)}.custom-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px}.custom-fields label{display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--muted)}.option-hint{font-size:14px;color:var(--muted);line-height:1.6;margin:10px 0 15px}
.export-error{margin:12px 0;color:#a94532;font-size:14px}
.export-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px}.export-main,.summary{padding:31px}.export-main>.section-kicker,.summary>.section-kicker{font-size:11px}.export-main h2,.summary h2{margin:0 0 25px;font:500 25px Georgia,serif}.format-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.format-grid button{position:relative;min-height:120px;padding:20px;border:1px solid var(--line);border-radius:8px;display:grid;grid-template-columns:43px 1fr;grid-template-rows:auto auto;background:transparent;text-align:left}.format-grid button:hover:not(.disabled){border-color:#999488}.format-grid button.active{border-color:var(--olive);box-shadow:0 0 0 2px rgba(89,107,86,.15);background:#f6f5ef}.format-grid button.disabled{opacity:.52;cursor:not-allowed}.format-grid button>span{grid-row:1/3;width:33px;height:42px;display:grid;place-items:center;border:1px solid #918c82;border-radius:2px;font:600 15px Georgia,serif}.format-grid strong{font:600 16px Georgia,serif}.format-grid small{margin-top:5px;color:#66635c;font-size:13px;line-height:1.4}.format-grid em{position:absolute;right:10px;top:9px;font:normal 11px sans-serif;color:#656159}.options{margin:27px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.options label{padding:17px 4px;display:flex;justify-content:space-between;color:#4f4c46;font-size:14px}.options input{width:17px;height:17px;accent-color:var(--olive)}.options label+label{border-top:1px solid #ebe6dc}.export-button{width:100%;min-height:44px;font-size:14px}.export-button:disabled{opacity:.45}.summary{align-self:start;background:#273a35;color:#f5f1e8}.summary .section-kicker{color:#e2a75a}.summary h2{font-size:23px}.summary>div{padding:22px 0;border-top:1px solid #4a5b56}.summary strong,.summary span{display:block}.summary strong{font:500 38px Georgia,serif}.summary span{margin-top:6px;color:#c7cfcb;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.summary p{margin:20px 0 0;color:#c3ccc8;font-size:13px;line-height:1.55}@media(max-width:760px){.export-grid{grid-template-columns:1fr}.summary{display:block}}@media(max-width:480px){.format-grid{grid-template-columns:1fr}.export-main,.summary{padding:23px}}
</style>
