<template>
  <div class="book-picker">
    <button ref="trigger" type="button" class="picker-trigger" :aria-label="allowAll ? 'Filter highlights by book' : 'Choose a book for this highlight'"
      aria-haspopup="dialog" :aria-expanded="open" @click="toggle">
      <span class="trigger-copy"><strong>{{ selected?.title || (allowAll ? 'Every book' : 'Choose a book…') }}</strong><small>{{ selected?.author || books.length + (allowAll ? ' books in your highlights' : ' books in your library') }}</small></span>
      <span class="chevron" :class="{ rotated: open }" aria-hidden="true">⌄</span>
    </button>
    <Teleport to="body">
      <Transition name="book-picker">
        <section v-if="open" ref="popup" class="picker-popup" :style="position" role="dialog" aria-label="Choose a book"
          @keydown.esc.stop.prevent="close(true)" @focusout="onFocusOut">
          <header><span>Choose a book</span><button type="button" aria-label="Close book picker" @click="close(true)">×</button></header>
          <div class="picker-search"><span aria-hidden="true">⌕</span><input ref="searchInput" v-model="search" placeholder="Search title or author…" aria-label="Search books"
            role="combobox" aria-autocomplete="list" :aria-controls="listId" :aria-expanded="true" :aria-activedescendant="options.length ? listId + '-' + active : undefined"
            @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="select(options[active])"></div>
          <div :id="listId" role="listbox" aria-label="Books" class="picker-results">
            <div v-for="(book,index) in options" :id="listId+'-'+index" :key="book.id" role="option"
              :aria-selected="modelValue===book.id" :class="['picker-option',{ highlighted:active===index, selected:modelValue===book.id }]"
              @pointermove="active=index" @mousedown.prevent @click="select(book)">
              <span class="selection-check" aria-hidden="true">{{ modelValue===book.id?'✓':'' }}</span>
              <span class="option-copy"><strong>{{ book.title }}</strong><small>{{ book.author }}</small></span>
              <span class="count" :aria-label="book.count+' highlights'">{{book.count}}</span>
            </div>
            <p v-if="!options.length" class="picker-empty">No matching books. Try another title or author.</p>
          </div>
          <footer><span>{{ matching.length }} books found</span><span>↑ ↓ to browse · Enter to select</span></footer>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { computed,ref,watch,nextTick,onBeforeUnmount,getCurrentInstance } from 'vue'
const props=defineProps({modelValue:{type:String,default:''},books:{type:Array,default:()=>[]},total:{type:Number,default:0},allowAll:{type:Boolean,default:true},popupLayer:{type:Number,default:120}})
const emit=defineEmits(['update:modelValue'])
const open=ref(false),search=ref(''),active=ref(0),trigger=ref(null),popup=ref(null),searchInput=ref(null),position=ref({})
const listId='book-options-'+getCurrentInstance().uid
const selected=computed(()=>props.books.find(book=>book.id===props.modelValue))
const matching=computed(()=>props.books.filter(book=>`${book.title} ${book.author}`.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())).slice().sort((a,b)=>a.title.localeCompare(b.title)))
const options=computed(()=>search.value.trim()||!props.allowAll?matching.value:[{id:'',title:'Every book',author:'All saved highlights',count:props.total},...matching.value])
const close=(restore=false)=>{open.value=false;document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',onScroll,true);if(restore)trigger.value?.focus()}
const outside=event=>{if(!popup.value?.contains(event.target)&&!trigger.value?.contains(event.target))close()}
const onScroll=event=>{if(!popup.value?.contains(event.target))close()}
const reposition=()=>{
  const rect=trigger.value.getBoundingClientRect(),width=Math.min(400,window.innerWidth-24)
  const below=window.innerHeight-rect.bottom-12,above=rect.top-12
  const down=below>=300||below>=above
  position.value={zIndex:props.popupLayer,width:width+'px',left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px',
    maxHeight:Math.min(460,Math.max(160,down?below:above))+'px',
    ...(down?{top:rect.bottom+6+'px'}:{bottom:window.innerHeight-rect.top+6+'px'})}
}
const toggle=async()=>{
  if(open.value){close();return}
  search.value='';active.value=0;reposition();open.value=true
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',onScroll,true)
  await nextTick();searchInput.value?.focus()
}
const move=async(delta)=>{if(!options.value.length)return;active.value=(active.value+delta+options.value.length)%options.value.length;await nextTick();document.getElementById(listId+'-'+active.value)?.scrollIntoView({block:'nearest'})}
const select=book=>{if(!book)return;emit('update:modelValue',book.id);close(true)}
const onFocusOut=event=>{if(!popup.value?.contains(event.relatedTarget)&&!trigger.value?.contains(event.relatedTarget))close()}
watch(search,()=>{active.value=0})
onBeforeUnmount(()=>close())
</script>
<style scoped>
.book-picker .picker-trigger{width:100%;min-height:62px;padding:12px;border:1px solid #cfc9bd;border-radius:10px;display:flex;align-items:center;gap:10px;background:#fffdf8;text-align:left;cursor:pointer;transition:border-color .2s,box-shadow .2s}
.book-picker .picker-trigger:hover,.book-picker .picker-trigger[aria-expanded=true]{background:#fffdf8;border-color:#71816f;box-shadow:0 0 0 3px #596b5610}
.trigger-copy{min-width:0;flex:1}.trigger-copy strong{display:block;overflow-wrap:anywhere;font-size:14px;font-weight:600;color:#343a31;line-height:1.4}.trigger-copy small{display:block;margin-top:4px;font-size:12px;color:#737168;line-height:1.4}
.chevron{font-size:22px;transition:transform .2s}.chevron.rotated{transform:rotate(180deg)}
.picker-popup{position:fixed;z-index:120;display:flex;flex-direction:column;overflow:hidden;border:1px solid #ded9ce;border-radius:14px;background:#fbfaf6;box-shadow:0 18px 50px #222a2730;color:#24231f}
.picker-popup header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 8px;font:600 18px Georgia,serif;flex-shrink:0}
.picker-popup header button{border:0;border-radius:50%;width:30px;height:30px;background:#eee9de;font-size:21px}
.picker-search{display:flex;align-items:center;gap:8px;margin:4px 12px 12px;padding:0 10px;border:1px solid #cfc9bd;border-radius:8px;background:white;flex-shrink:0}
.picker-search:focus-within{border-color:#71816f;box-shadow:0 0 0 3px #596b5614}
.picker-search>span{font-size:23px;color:#737168}.picker-search input{width:100%;height:42px;border:0;background:transparent;outline:none;color:#24231f}
.picker-results{overflow-y:auto;overscroll-behavior:contain;min-height:0;padding:0 7px 7px;scrollbar-width:thin}
.picker-option{display:flex;align-items:center;gap:9px;min-height:64px;padding:11px 9px;margin-bottom:3px;border-radius:8px;cursor:pointer}
.picker-option.highlighted{background:#eee9de}.picker-option.selected{background:#e8eee5}
.selection-check{width:18px;flex:none;color:#476043;font-weight:700}.option-copy{min-width:0;flex:1}.option-copy strong{display:block;font-size:14px;line-height:1.45;font-weight:600;overflow-wrap:anywhere}.option-copy small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:#737168}
.count{flex:none;padding:4px 8px;border-radius:12px;background:#ffffffa6;color:#596b56;font-size:12px;font-variant-numeric:tabular-nums}
.picker-popup footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding:12px 16px;border-top:1px solid #ded9ce;color:#737168;font-size:12px;flex-shrink:0}
.picker-empty{padding:20px 12px;color:#737168;font-size:14px;line-height:1.6}
.book-picker-enter-active,.book-picker-leave-active{transition:opacity .16s,transform .2s}.book-picker-enter-from,.book-picker-leave-to{opacity:0;transform:translateY(-5px)}
@media(prefers-reduced-motion:reduce){.book-picker-enter-active,.book-picker-leave-active,.chevron,.picker-trigger{transition:none}}
</style>
