<template>
  <article class="quote-card panel" :class="{ 'palette-active': paletteOpen, 'is-favorite': quote.isFavorite }" :style="{ '--marker': colorMap[previewColor || quote.color] || colorMap.yellow }">
    <div v-if="quote.isFavorite" class="favorite-glimmer" aria-hidden="true">
      <span class="shimmer-sweep"></span>
      <span v-for="spark in 6" :key="spark" class="favorite-spark" :class="'spark-' + spark">✦</span>
    </div>
    <div class="marker">
      <button ref="colorTrigger" class="color-trigger" type="button"
        :aria-label="'Change highlight color, currently ' + (quote.color || 'yellow')"
        :aria-expanded="paletteOpen" :aria-controls="'quote-colors-' + quote.id"
        @pointerenter="hoverPalette" @pointerleave="scheduleClose"
        @click="openPalette" @keydown.esc.stop="closePalette" />
    </div>
    <div class="quote-body">
      <div v-if="!editing && !annotationEditing" ref="moreActions" class="quote-actions" @keydown.esc.stop="closeMoreMenu"><button :title="quote.isFavorite?'Remove favorite':'Add favorite'" @click="quotesStore.toggleFavorite(quote.id)">{{ quote.isFavorite?'♥':'♡' }}</button><button title="More options" :aria-expanded="menuOpen" @click="toggleMoreMenu">•••</button><div v-if="menuOpen" class="menu"><button @click="startEdit">Edit text</button><button @click="startAnnotations">{{quote.note?'Edit note':'Add note'}}</button><BookTagEditor ref="menuTagEditor" :quote="quote" :trigger-label="quote.tags?.length?'Edit tags':'Add tags'" /><button class="danger" @click="remove">Delete</button></div></div>
      <textarea v-if="editing" v-model="editedText" rows="4" aria-label="Highlight text" autofocus></textarea>
      <blockquote v-else>{{ quote.text }}</blockquote>
      <div v-if="editing" class="edit-actions"><button @click="cancelEdit">Cancel</button><button @click="saveEdit">Save changes</button></div>
      <div v-if="annotationEditing" class="annotation-editor">
        <textarea v-model="draftNote" rows="3" aria-label="Highlight note" placeholder="What does this passage mean to you?"></textarea>
        <div class="edit-actions"><button @click="annotationEditing=false">Cancel</button><button @click="saveAnnotations">Save note</button></div>
      </div>
      <div v-else-if="!editing&&(quote.note||quote.tags?.length)" class="annotations">
        <div v-if="quote.note" class="note-display"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 4h14v12l-5 4H5zM8 8h8M8 12h6"/></svg><p>{{quote.note}}</p><button type="button" title="Edit note" aria-label="Edit note" @click="startAnnotations">✎</button></div>
        <BookTagEditor v-if="quote.tags?.length" :quote="quote" />
      </div>
      <footer>
        <router-link v-if="book" :to="`/books/${book.id}`"><span><strong>{{ book.title }}</strong><small>{{ book.author }}</small></span></router-link>
        <div class="quote-meta"><span v-if="quote.page">p. {{ quote.page }}</span><span v-if="quote.location">{{ quote.location }}</span><span>{{ formatDate(quote.dateHighlighted || quote.dateAdded) }}</span></div>
      </footer>
    </div>
  </article>
  <Teleport to="body">
    <Transition :name="paletteStyle === 'rail' ? 'rail' : 'palette'">
      <div v-if="paletteOpen" :id="'quote-colors-' + quote.id" ref="paletteElement"
        class="color-palette" :class="{ 'color-rail': paletteStyle === 'rail' }" :style="palettePosition" role="group" aria-label="Highlight color"
        @pointerenter="cancelClose" @pointerleave="scheduleClose"
        @focusout="handleFocusOut" @keydown.esc.stop.prevent="dismissPalette">
        <span v-if="paletteStyle === 'grid'" class="palette-caption">COLOR</span>
        <button v-for="(hex, name, index) in colorMap" :key="name" type="button"
          class="color-swatch" :style="{ '--swatch': hex, '--step': index }"
          :aria-label="name" :title="name" :aria-pressed="(quote.color || 'yellow') === name"
          @pointerenter="previewColor = name" @pointerleave="previewColor = ''"
          @focus="previewColor = name" @blur="previewColor = ''"
          @click="chooseColor(name, $event)">
          <span>{{ (quote.color || 'yellow') === name ? '✓' : '' }}</span>
        </button>
      </div>
    </Transition>
  </Teleport>
  <Dialog :show="showDeleteConfirm" @update:show="showDeleteConfirm=$event">
    <div class="delete-mark">!</div>
    <div class="delete-copy"><span>DELETE HIGHLIGHT</span><h2>Let this passage go?</h2><p>This highlight will be permanently removed from your collection. This cannot be undone.</p></div>
    <div class="delete-actions"><button @click="showDeleteConfirm=false">Keep highlight</button><button class="delete-button" @click="confirmRemove">Delete highlight</button></div>
  </Dialog>
</template>
<script setup>
import { computed,ref,nextTick,onBeforeUnmount } from 'vue'
import { useBooksStore,useQuotesStore } from '@/stores'
import Dialog from './Dialog.vue'
import BookTagEditor from './BookTagEditor.vue'
const props=defineProps({
  quote:{type:Object,required:true},
  paletteStyle:{type:String,default:'rail',validator:value=>['rail','grid'].includes(value)}
})
const booksStore=useBooksStore(),quotesStore=useQuotesStore()
const editing=ref(false),editedText=ref(''),menuOpen=ref(false),showDeleteConfirm=ref(false)
const moreActions=ref(null),menuTagEditor=ref(null)
const closeMoreMenu=()=>{menuOpen.value=false;document.removeEventListener('pointerdown',outsideMoreMenu)}
const outsideMoreMenu=event=>{
  if(!moreActions.value?.contains(event.target)&&!menuTagEditor.value?.containsTarget(event.target))closeMoreMenu()
}
const toggleMoreMenu=()=>{
  if(menuOpen.value){closeMoreMenu();return}
  menuOpen.value=true
  document.addEventListener('pointerdown',outsideMoreMenu)
}
onBeforeUnmount(closeMoreMenu)
const annotationEditing=ref(false),draftNote=ref('')
const startAnnotations=()=>{draftNote.value=props.quote.note||'';closeMoreMenu();annotationEditing.value=true}
const saveAnnotations=()=>{quotesStore.updateQuote(props.quote.id,{note:draftNote.value.trim()});annotationEditing.value=false}
const colorMap={yellow:'#d99a3d',red:'#c8614d',pink:'#bf7181',blue:'#557d94',green:'#708b6c',orange:'#d8753e',gray:'#8b8a84',purple:'#816d91'}
const paletteOpen=ref(false),previewColor=ref(''),colorTrigger=ref(null),paletteElement=ref(null),palettePosition=ref({})
let closeTimer
let keyboardPalette=false
const cancelClose=()=>clearTimeout(closeTimer)
const closePalette=()=>{
  cancelClose()
  paletteOpen.value=false
  previewColor.value=''
  document.removeEventListener('pointerdown',outsidePalette)
  window.removeEventListener('scroll',closePalette,true)
  window.removeEventListener('resize',closePalette)
}
const outsidePalette=event=>{
  if(!paletteElement.value?.contains(event.target)&&!colorTrigger.value?.contains(event.target))closePalette()
}
const openPalette=async(event)=>{
  cancelClose()
  keyboardPalette=event?.type==='click'&&event.detail===0
  const rect=colorTrigger.value.getBoundingClientRect()
  const width=props.paletteStyle==='rail'?54:86
  const height=props.paletteStyle==='rail'?326:208
  const opensLeft=rect.left>=width+20
  // Prefer the left gutter; keep the palette inside the viewport on small screens.
  palettePosition.value={
    left:Math.max(8,Math.min(window.innerWidth-width-8,opensLeft?rect.left-width-8:rect.right+8))+'px',
    top:Math.max(8,Math.min(window.innerHeight-height-8,rect.top+20))+'px',
    '--arrival':opensLeft?'18px':'-18px',
    '--fan-angle':opensLeft?'-12deg':'12deg',
    transformOrigin:opensLeft?'right center':'left center'
  }
  paletteOpen.value=true
  document.addEventListener('pointerdown',outsidePalette)
  window.addEventListener('scroll',closePalette,true)
  window.addEventListener('resize',closePalette)
  await nextTick()
  if(event?.type==='click'&&event.detail===0)paletteElement.value?.querySelector('button')?.focus()
}
const hoverPalette=event=>{if(event.pointerType==='mouse')openPalette()}
const scheduleClose=()=>{
  cancelClose()
  closeTimer=setTimeout(()=>{
    if(!keyboardPalette||!paletteElement.value?.contains(document.activeElement))closePalette()
  },220)
}
const dismissPalette=()=>{closePalette();colorTrigger.value?.focus()}
const handleFocusOut=event=>{
  if(!paletteElement.value?.contains(event.relatedTarget))closePalette()
}
const chooseColor=(name,event)=>{
  quotesStore.updateQuote(props.quote.id,{color:name})
  if(event?.detail===0) dismissPalette()
  else closePalette()
}
onBeforeUnmount(closePalette)
const book=computed(()=>booksStore.getBookById(props.quote.bookId))
const formatDate=value=>value&&!isNaN(new Date(value))?new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric'}).format(new Date(value)):''
const startEdit=()=>{editedText.value=props.quote.text;editing.value=true;closeMoreMenu()}
const cancelEdit=()=>{editing.value=false;editedText.value=''}
const saveEdit=()=>{if(editedText.value.trim())quotesStore.updateQuote(props.quote.id,{text:editedText.value.trim()});cancelEdit()}
const remove=()=>{closeMoreMenu();showDeleteConfirm.value=true}
const confirmRemove=()=>{quotesStore.deleteQuote(props.quote.id);showDeleteConfirm.value=false}
</script>
<style scoped>
.note-display{display:flex;align-items:flex-start;gap:12px;padding:15px 16px;margin:0 0 10px;border-radius:9px;background:#eeebe466;color:#686255}.note-display>svg{flex:none;margin-top:4px;color:#9a8e78}.note-display p{flex:1;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:15px;line-height:1.75}.note-display button{flex:none;width:28px;height:28px;border:0;border-radius:5px;background:transparent;color:#8a7b65;font-size:19px;cursor:pointer}.note-display button:hover{background:#e2dbcf}.annotation-tools{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.annotation-tools :deep(.tag-cell){width:auto;min-width:0;flex:1}
.annotations{margin:0 0 18px}.quote-note{border-left:2px solid var(--line);padding:4px 0 4px 14px;margin-bottom:12px}.quote-note strong{font-size:11px;letter-spacing:.1em;color:var(--muted)}.quote-note p{white-space:pre-wrap;overflow-wrap:anywhere;margin:7px 0 0;font-size:15px;line-height:1.65}.quote-tags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.quote-tags span{border-radius:5px;background:#e8e5da;color:#52614d;padding:4px 9px;font-size:13px}.annotation-trigger{padding:5px 0;border:0;background:transparent;color:var(--muted);font-size:13px}.annotation-trigger:hover{color:var(--accent)}.annotation-editor{margin-bottom:18px}.annotation-editor label{display:block;margin:12px 0;font-size:14px;color:var(--muted)}.annotation-editor textarea,.annotation-editor input{display:block;margin-top:7px;width:100%;border:1px solid var(--line);border-radius:7px;padding:10px 12px;background:var(--paper);color:var(--ink);font:400 15px/1.6 sans-serif}.annotation-editor small{display:block;margin-top:6px;font-size:12px}
.quote-card.is-favorite{border-color:#d9c59c;background:#fffaf0;box-shadow:0 4px 22px #bd903414}
.favorite-glimmer{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;user-select:none;background:radial-gradient(ellipse at 95% 5%,#f1cc7433,transparent 45%),radial-gradient(ellipse at 5% 100%,#eed9a526,transparent 45%)}
.shimmer-sweep{position:absolute;inset:-50% -80%;background:linear-gradient(110deg,transparent 42%,#fffdf700 46%,#ffffffa6 50%,#fff1bc38 53%,transparent 58%);transform:translateX(-50%);animation:favorite-shimmer 9s ease-in-out infinite}
.favorite-spark{position:absolute;color:#bc882c;font-size:15px;line-height:1;opacity:0;animation:favorite-twinkle 5.5s ease-in-out infinite}
.spark-1{left:3%;top:15%;animation-delay:-.6s;font-size:11px}
.spark-2{right:17%;top:8%;animation-delay:-2.4s}
.spark-3{right:3%;top:46%;animation-delay:-4.1s;font-size:19px}
.spark-4{left:10%;bottom:7%;animation-delay:-1.7s;font-size:10px}
.spark-5{right:30%;bottom:4%;animation-delay:-3.3s;font-size:12px}
.spark-6{left:52%;top:3%;animation-delay:-4.9s;font-size:9px}
.quote-card.is-favorite>.quote-body{position:relative}
.quote-card.is-favorite>.marker{z-index:1}
.is-favorite .quote-actions>button:first-child{color:#aa7224;background:#f4e6c5}
@keyframes favorite-shimmer{0%,20%{transform:translateX(-50%);opacity:0}28%{opacity:.65}62%{transform:translateX(50%);opacity:0}100%{transform:translateX(50%);opacity:0}}
@keyframes favorite-twinkle{0%,65%,100%{opacity:0;transform:scale(.55) rotate(-12deg)}78%{opacity:.55;transform:scale(1.15) rotate(8deg)}90%{opacity:.18;transform:scale(.85) rotate(0)}}
@media(prefers-reduced-motion:reduce){.shimmer-sweep{display:none}.favorite-spark{animation:none;opacity:.22;transform:none}}
.quote-card>.marker{position:relative;background:transparent}
.marker::before{content:'';position:absolute;top:0;bottom:0;left:0;width:4px;background:var(--marker);border-radius:999px;pointer-events:none;transition:width .26s cubic-bezier(.22,.61,.36,1),background-color .25s ease,box-shadow .25s ease}
.palette-active .marker::before{width:12px;box-shadow:3px 0 16px color-mix(in srgb,var(--marker) 25%,transparent)}
@media(hover:hover){.marker:hover::before{width:12px}}
.color-trigger{position:absolute;inset:0 -10px 0 -10px;width:24px;border:0;background:transparent;border-radius:12px;cursor:pointer;z-index:2}
.color-trigger:focus-visible{outline:2px solid var(--marker);outline-offset:3px}
.color-palette{position:fixed;z-index:110;display:grid;grid-template-columns:repeat(2,32px);gap:8px;padding:10px;border:1px solid #ded9ce;border-radius:15px;background:#fbfaf6;box-shadow:0 12px 35px #222a2729;transform-origin:right center}
.palette-caption{grid-column:1/-1;text-align:center;font-size:11px;font-weight:700;letter-spacing:.12em;color:#737168;line-height:18px}
.color-swatch{width:32px;height:32px;padding:4px;border:1px solid transparent;border-radius:50%;background:transparent;transition:transform .2s ease,border-color .2s ease;animation:swatch-in .3s both;animation-delay:calc(var(--step)*22ms)}
.color-swatch span{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--swatch);color:white;font-size:15px;box-shadow:inset 0 0 0 1px #00000010}
.color-swatch:hover{transform:scale(1.15)}
.color-swatch[aria-pressed="true"]{border-color:var(--swatch)}
.color-swatch:focus-visible{outline:2px solid #263a34;outline-offset:2px}
.palette-enter-active{transition:opacity .2s ease,transform .32s cubic-bezier(.18,.85,.32,1.2)}
.palette-leave-active{transition:opacity .14s ease,transform .14s ease}
.palette-enter-from,.palette-leave-to{opacity:0;transform:translateX(10px) scale(.88)}
@keyframes swatch-in{from{opacity:0;transform:translateX(8px) scale(.6)}to{opacity:1;transform:translateX(0) scale(1)}}
.color-rail{width:54px;grid-template-columns:36px;gap:4px;padding:6px 8px;border-radius:28px;background:#263a34;border-color:#45574e;box-shadow:0 16px 38px #14291f33,inset 0 1px 0 #ffffff20;max-height:calc(100dvh - 16px);overflow-y:auto}
.color-rail .color-swatch{width:36px;height:36px;padding:5px;animation:rail-swatch-in .48s cubic-bezier(.16,1,.3,1) backwards;animation-delay:calc(var(--step)*28ms);border-color:transparent}
.color-rail .color-swatch span{transition:transform .22s cubic-bezier(.2,.9,.3,1.4),box-shadow .22s ease;box-shadow:inset 0 0 0 1px #ffffff25}
.color-rail .color-swatch[aria-pressed="true"]{border-color:#ffffffb3;background:#ffffff0a}
.color-rail .color-swatch:hover,.color-rail .color-swatch:focus-visible{transform:none;background:#ffffff12}
.color-rail .color-swatch:hover span,.color-rail .color-swatch:focus-visible span{transform:scale(1.18);box-shadow:0 0 13px color-mix(in srgb,var(--swatch) 65%,transparent)}
.color-rail .color-swatch:focus-visible{outline:2px solid #f4f1ea;outline-offset:0}
.rail-enter-active{transition:opacity .2s ease,transform .4s cubic-bezier(.16,1,.3,1)}
.rail-leave-active{transition:opacity .16s ease,transform .2s ease}
.rail-enter-from,.rail-leave-to{opacity:0;transform:translateX(var(--arrival)) scaleX(.45) scaleY(.92)}
@keyframes rail-swatch-in{from{opacity:0;transform:translateX(var(--arrival)) translateY(calc((3.5 - var(--step))*9px)) rotate(var(--fan-angle)) scale(.55)}to{opacity:1;transform:translate(0) rotate(0) scale(1)}}
@media(prefers-reduced-motion:reduce){.marker,.marker::before,.color-swatch,.color-rail .color-swatch,.color-rail .color-swatch span,.palette-enter-active,.palette-leave-active,.rail-enter-active,.rail-leave-active{transition:none;animation:none}}
.quote-card{position:relative;display:flex;overflow:visible}.marker{width:4px;flex:none;border-radius:12px 0 0 12px;background:var(--marker)}.quote-body{min-width:0;flex:1;padding:25px 28px 20px}.quote-actions{position:absolute;right:18px;top:14px;display:flex;gap:4px}.quote-actions>button{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:#8d897f;font-size:17px}.quote-actions>button:hover{background:#eee9de;color:var(--accent)}.quote-actions .menu{position:absolute;right:0;top:34px;z-index:5;width:125px;padding:5px;border:1px solid var(--line);border-radius:7px;background:white;box-shadow:0 10px 25px rgba(0,0,0,.12)}.quote-actions .menu button{width:100%;padding:8px;border:0;border-radius:4px;background:transparent;text-align:left;font-size:13px}.quote-actions .menu button:hover{background:#f3f0e9}.quote-actions .menu .danger{color:#b74c3a}.quote-body blockquote{max-width:830px;margin:0;padding:3px 75px 25px 0;font:400 21px/1.55 Georgia,serif;color:#34312b}.quote-body textarea{width:100%;padding:12px;border:1px solid #aaa397;border-radius:7px;background:#fffdf8;font:400 18px/1.5 Georgia,serif;outline:none}.edit-actions{display:flex;justify-content:flex-end;gap:7px;margin:8px 0}.edit-actions button{padding:7px 11px;border:1px solid var(--line);border-radius:5px;background:white;font-size:12px}.edit-actions button:last-child{background:var(--olive);color:white;border-color:var(--olive)}footer{padding-top:15px;border-top:1px solid #ebe6dc;display:flex;align-items:center;justify-content:space-between;gap:16px}footer>a{display:flex;align-items:center}footer strong,footer small{display:block}footer strong{max-width:420px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:600 14px Georgia,serif}footer small{margin-top:4px;color:var(--muted);font-size:12px}.quote-meta{display:flex;gap:14px;color:#7f7b72;font-size:11px}@media(max-width:560px){.quote-body{padding:21px 18px 17px}.quote-body blockquote{padding-right:35px;font-size:18px}footer{align-items:flex-start;flex-direction:column}.quote-meta{width:100%;justify-content:flex-end}}
.delete-mark{width:48px;height:48px;margin-bottom:20px;display:grid;place-items:center;border-radius:50%;background:#f0dcd6;color:#a94432;font:600 24px Georgia,serif}.delete-copy>span{color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.17em}.delete-copy h2{margin:5px 0 0;font:500 31px Georgia,serif}.delete-copy p{margin:14px 0 0;color:var(--muted);font-size:12px;line-height:1.65}.delete-actions{margin-top:27px;padding-top:18px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:8px}.delete-actions button{min-height:39px;padding:0 15px;border:1px solid var(--line);border-radius:6px;background:transparent;font-size:11px;font-weight:700}.delete-actions .delete-button{border-color:#a94532;background:#a94532;color:white}
</style>
