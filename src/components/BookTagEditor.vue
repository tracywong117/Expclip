<template>
  <div v-if="readOnly" class="tag-display"><span v-for="tag in item.tags||[]" :key="tag" class="tag-pill" :style="styleFor(tag)">{{tag}}</span></div>
  <button v-else ref="trigger" type="button" class="tag-cell" :class="{'menu-trigger':triggerLabel}" :aria-label="`Edit tags for ${item.title||'highlight'}`" aria-haspopup="dialog" :aria-expanded="open" @click="toggle">
    <template v-if="triggerLabel">{{triggerLabel}}</template>
    <template v-else>
    <span v-for="tag in item.tags||[]" :key="tag" class="tag-pill" :style="styleFor(tag)">{{tag}}</span>
    <span v-if="quote&&!item.tags?.length" class="tag-placeholder">＋ Tags</span>
    <span v-if="item.tags?.length" class="tag-plus" aria-hidden="true">＋</span>
    </template>
  </button>
  <Teleport to="body">
    <Transition name="tags-menu">
      <section v-if="open" ref="popup" class="tag-menu" :style="position" role="dialog" :aria-label="`Tags for ${item.title||'highlight'}`" @keydown.esc.stop.prevent="close(true)" @focusout="onFocusOut">
        <header><strong>{{quote ? 'Highlight tags' : 'Book tags'}}</strong><button type="button" aria-label="Close tag editor" @click="close(true)">×</button></header>
        <div class="selected-tags" v-if="item.tags?.length"><button v-for="tag in item.tags" :key="tag" type="button" class="tag-pill" :style="styleFor(tag)" :aria-label="`Remove ${tag} from this item`" @click="toggleTag(tag)">{{tag}} <span aria-hidden="true">×</span></button></div>
        <input ref="searchInput" v-model="query" class="tag-search" placeholder="Search or create a tag…" aria-label="Search or create a tag" maxlength="80" @keydown.enter.prevent="chooseQuery">
        <p class="menu-hint">Select tags or type a new one</p>
        <div class="tag-options">
          <div v-for="tag in matches" :key="tag" class="tag-option">
            <div class="tag-option-row"><button type="button" class="tag-select" :aria-pressed="(item.tags||[]).includes(tag)" @click="toggleTag(tag)"><span class="tag-check" aria-hidden="true">{{(item.tags||[]).includes(tag)?'✓':''}}</span><span class="tag-pill" :style="styleFor(tag)">{{tag}}</span></button><button type="button" class="tag-more" :aria-label="`Change color for ${tag}`" :aria-expanded="colorTag===tag" @click="colorTag=colorTag===tag?null:tag">•••</button></div>
            <div v-if="colorTag===tag" class="tag-color-panel"><span>Color · applies to all {{quote?'highlights':'books'}}</span><div><button v-for="(style,name) in tagColors" :key="name" type="button" :style="style" :title="name" :aria-label="`${name} color for ${tag}`" :aria-pressed="(colors[tag]||'gray')===name" @click="setColor(tag,name)">{{(colors[tag]||'gray')===name?'✓':''}}</button></div></div>
          </div>
          <button v-if="canCreate" type="button" class="create-tag" @click="createTag">＋ Create <span class="tag-pill" :style="tagColors.gray">{{query.trim()}}</span></button>
          <p v-if="!matches.length&&!canCreate" class="menu-hint">No tags yet. Type to create your first tag.</p>
        </div>
        <footer>Changes save automatically</footer>
      </section>
    </Transition>
  </Teleport>
</template>
<script setup>
import {computed,ref,nextTick,onBeforeUnmount} from 'vue'
import {useBooksStore,useQuotesStore} from '@/stores'
import {useSettingsStore} from '@/stores/settings'
import {tagColors,tagStyle,matchingTag} from '@/utils/tagColors'
const props=defineProps({book:{type:Object,default:null},quote:{type:Object,default:null},readOnly:Boolean,triggerLabel:{type:String,default:''}})
const item=computed(()=>props.quote||props.book)
const colorKey=computed(()=>props.quote?'highlightTagColors':'bookTagColors')
const booksStore=useBooksStore(),quotesStore=useQuotesStore(),settingsStore=useSettingsStore()
const trigger=ref(null),popup=ref(null),searchInput=ref(null),open=ref(false),query=ref(''),colorTag=ref(null),position=ref({})
const colors=computed(()=>settingsStore.settings[colorKey.value]||{})
const allTags=computed(()=>[...new Set([...(props.quote?quotesStore.quotes:booksStore.books).flatMap(record=>record.tags||[]),...Object.keys(colors.value)])].sort((a,b)=>a.localeCompare(b)))
const matches=computed(()=>allTags.value.filter(tag=>tag.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase())))
const canCreate=computed(()=>!!query.value.trim()&&!matchingTag(query.value,allTags.value))
const styleFor=tag=>tagStyle(tag,colors.value)
const setColor=(tag,color)=>{settingsStore.updateSetting(colorKey.value,{...colors.value,[tag]:color})}
const toggleTag=tag=>{
  const tags=item.value.tags||[]
  // Keep created options available even after they are removed from every book.
  if(!Object.hasOwn(colors.value,tag))setColor(tag,'gray')
  const update={tags:tags.includes(tag)?tags.filter(item=>item!==tag):[...tags,tag]}
  if(props.quote)quotesStore.updateQuote(item.value.id,update)
  else booksStore.updateBook(item.value.id,update)
}
const createTag=()=>{
  const name=query.value.trim()
  if(!name)return
  const existing=matchingTag(name,allTags.value)
  const tag=existing||name
  if(!(item.value.tags||[]).includes(tag))toggleTag(tag)
  query.value='';colorTag.value=null
  searchInput.value?.focus()
}
const chooseQuery=()=>{
  if(!query.value.trim())return
  const existing=matchingTag(query.value,allTags.value)
  if(existing){toggleTag(existing);query.value=''}else createTag()
}
const reposition=()=>{
  if(!open.value||!trigger.value)return
  const rect=trigger.value.getBoundingClientRect(),width=Math.min(350,window.innerWidth-24)
  const below=window.innerHeight-rect.bottom-12,above=rect.top-12,down=below>=280||below>=above
  position.value={width:width+'px',left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px',maxHeight:Math.max(120,Math.min(480,down?below:above))+'px',...(down?{top:rect.bottom+6+'px'}:{bottom:window.innerHeight-rect.top+6+'px'})}
}
const outside=event=>{if(!popup.value?.contains(event.target)&&!trigger.value?.contains(event.target))close()}
const onScroll=event=>{if(!popup.value?.contains(event.target))reposition()}
const close=(restore=false)=>{open.value=false;document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',onScroll,true);if(restore)trigger.value?.focus()}
const toggle=async()=>{
  if(open.value){close();return}
  open.value=true;query.value='';colorTag.value=null;reposition()
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',onScroll,true)
  await nextTick();searchInput.value?.focus()
}
const onFocusOut=event=>{if(!popup.value?.contains(event.relatedTarget)&&!trigger.value?.contains(event.relatedTarget))close()}
onBeforeUnmount(()=>close())
defineExpose({containsTarget:target=>!!(trigger.value?.contains(target)||popup.value?.contains(target))})
</script>
<style scoped>
.tag-display{display:flex;flex-wrap:wrap;gap:6px}.tag-cell.menu-trigger{min-width:0;min-height:0;padding:8px;border-radius:4px;color:inherit;font-size:13px}.tag-cell.menu-trigger:hover{background:#f3f0e9}
.tag-cell{display:flex;align-items:center;flex-wrap:wrap;gap:5px;width:100%;min-width:130px;min-height:32px;padding:4px;border:0;border-radius:5px;background:transparent;text-align:left;cursor:pointer}.tag-cell:hover{background:#eae6dd}.tag-pill{display:inline-flex;gap:7px;align-items:center;max-width:100%;overflow-wrap:anywhere;padding:3px 8px;border:0;border-radius:4px;font-size:13px;line-height:1.5;text-align:left}.tag-placeholder,.tag-plus{color:#8a867f;font-size:13px}.tag-menu{position:fixed;z-index:130;display:flex;flex-direction:column;border:1px solid #ded9cf;border-radius:10px;background:#fffdf8;color:#34312b;box-shadow:0 12px 40px #26231e2b;overflow:hidden}.tag-menu header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;font-size:15px}.tag-menu header button{width:28px;height:28px;border:0;border-radius:4px;background:transparent;color:#777;font-size:22px}.tag-search{flex:none;margin:0 12px;padding:10px 11px;min-width:0;border:1px solid #d3cec4;border-radius:6px;background:white;color:#34312b;font-size:15px}.tag-search:focus{outline:2px solid #8b9e85;outline-offset:1px}.selected-tags{display:flex;flex-wrap:wrap;gap:5px;padding:0 12px 12px;max-height:100px;overflow:auto}.menu-hint{margin:10px 14px;color:#8b867d;font-size:12px}.tag-options{overflow:auto;min-height:0;padding:0 6px 8px;overscroll-behavior:contain}.tag-option-row{display:flex;align-items:center;border-radius:5px}.tag-option-row:hover{background:#f0ede6}.tag-select{display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:7px 6px;border:0;background:transparent;text-align:left}.tag-check{width:17px;flex:none;color:#586c50}.tag-more{flex:none;width:32px;height:32px;border:0;border-radius:4px;background:transparent;color:#7a746b}.tag-more:hover{background:#e5e0d6}.tag-color-panel{padding:9px 12px;margin:0 6px 8px;border:1px solid #e3ded4;border-radius:6px}.tag-color-panel>span{font-size:12px;color:#777}.tag-color-panel>div{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.tag-color-panel button{width:25px;height:25px;border:1px solid transparent;border-radius:5px}.tag-color-panel button[aria-pressed=true]{border-color:currentColor}.create-tag{width:100%;display:flex;gap:8px;align-items:center;padding:10px 12px;border:0;border-radius:5px;background:transparent;text-align:left;font-size:14px}.create-tag:hover{background:#f0ede6}.tag-menu footer{padding:10px 14px;border-top:1px solid #e3ded4;color:#8b867d;font-size:12px}.tag-menu button{cursor:pointer}.tag-menu button:focus-visible,.tag-cell:focus-visible{outline:2px solid #71816f;outline-offset:1px}.tags-menu-enter-active,.tags-menu-leave-active{transition:opacity .12s,transform .12s}.tags-menu-enter-from,.tags-menu-leave-to{opacity:0;transform:translateY(-4px)}@media(prefers-reduced-motion:reduce){.tags-menu-enter-active,.tags-menu-leave-active{transition:none}}
</style>
