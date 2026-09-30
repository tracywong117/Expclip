<template>
  <div class="tag-filter-picker">
    <button ref="trigger" type="button" class="tag-filter-trigger" aria-label="Filter highlights by tag" aria-haspopup="dialog" :aria-expanded="open" @click="toggle">
      <span v-if="modelValue" class="tag-chip" :style="styleFor(modelValue)">{{modelValue}}</span><span v-else>All tags</span><span class="chevron" aria-hidden="true">⌄</span>
    </button>
    <Teleport to="body">
      <Transition name="tag-filter">
        <section v-if="open" ref="popup" class="tag-filter-popup" :style="position" role="dialog" aria-label="Choose a highlight tag" @keydown.esc.stop.prevent="close(true)" @focusout="onFocusOut">
          <header><strong>Filter by tag</strong><button type="button" aria-label="Close tag filter" @click="close(true)">×</button></header>
          <input ref="searchInput" v-model="search" class="tag-search" placeholder="Search tags…" aria-label="Search highlight tags" role="combobox" aria-autocomplete="list" :aria-controls="listId" aria-expanded="true" :aria-activedescendant="`${listId}-${active}`" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="choose(options[active].name)">
          <div :id="listId" class="tag-results" role="listbox" aria-label="Highlight tags">
            <div v-for="(tag,index) in options" :id="`${listId}-${index}`" :key="tag.name" role="option" :aria-selected="modelValue===tag.name" :class="['tag-option',{highlighted:active===index}]" @pointermove="active=index" @mousedown.prevent @click="choose(tag.name)">
              <span class="check" aria-hidden="true">{{modelValue===tag.name?'✓':''}}</span><span class="tag-chip" :style="tag.name?styleFor(tag.name):{}">{{tag.name||'All tags'}}</span><small>{{tag.count}}</small>
            </div>
            <p v-if="!matches.length">{{search?'No matching tags.':'Add tags to highlights from their ••• menu.'}}</p>
          </div>
          <footer>↑ ↓ to browse · Enter to select</footer>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import {computed,ref,watch,nextTick,onBeforeUnmount,getCurrentInstance} from 'vue'
import {useSettingsStore} from '@/stores/settings'
import {tagStyle} from '@/utils/tagColors'
const props=defineProps({modelValue:{type:String,default:''},tags:{type:Array,default:()=>[]},total:{type:Number,default:0}})
const emit=defineEmits(['update:modelValue']),settingsStore=useSettingsStore()
const open=ref(false),search=ref(''),active=ref(0),trigger=ref(null),popup=ref(null),searchInput=ref(null),position=ref({})
const listId='tag-filter-'+getCurrentInstance().uid
const matches=computed(()=>props.tags.filter(tag=>tag.name.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())))
const options=computed(()=>[{name:'',count:props.total},...matches.value])
const styleFor=tag=>tagStyle(tag,settingsStore.settings.highlightTagColors||{})
const reposition=()=>{
  if(!open.value||!trigger.value)return
  const rect=trigger.value.getBoundingClientRect(),width=Math.min(330,window.innerWidth-24)
  const below=window.innerHeight-rect.bottom-12,above=rect.top-12,down=below>=300||below>=above
  position.value={width:width+'px',left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px',maxHeight:Math.max(120,Math.min(440,down?below:above))+'px',...(down?{top:rect.bottom+6+'px'}:{bottom:window.innerHeight-rect.top+6+'px'})}
}
const outside=event=>{if(!popup.value?.contains(event.target)&&!trigger.value?.contains(event.target))close()}
const onScroll=event=>{if(!popup.value?.contains(event.target))reposition()}
const close=(restore=false)=>{open.value=false;document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',onScroll,true);if(restore)trigger.value?.focus()}
const toggle=async()=>{
  if(open.value){close();return}
  search.value='';active.value=0;open.value=true;reposition()
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',onScroll,true)
  await nextTick();searchInput.value?.focus()
}
const move=async(delta)=>{active.value=(active.value+delta+options.value.length)%options.value.length;await nextTick();document.getElementById(`${listId}-${active.value}`)?.scrollIntoView({block:'nearest'})}
const choose=name=>{emit('update:modelValue',name);close(true)}
const onFocusOut=event=>{if(!popup.value?.contains(event.relatedTarget)&&!trigger.value?.contains(event.relatedTarget))close()}
watch(options,()=>{active.value=0})
onBeforeUnmount(()=>close())
</script>
<style scoped>
.tag-filter-picker .tag-filter-trigger{width:100%;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border:1px solid #cfc9bd;border-radius:8px;background:#fffdf8;color:#4e4b45;font-size:14px;text-align:left;cursor:pointer}.tag-filter-picker .tag-filter-trigger:hover,.tag-filter-picker .tag-filter-trigger[aria-expanded=true]{border-color:#71816f;box-shadow:0 0 0 3px #596b5610}.tag-chip{padding:3px 8px;border-radius:4px;overflow-wrap:anywhere;font-size:14px;line-height:1.5}.chevron{flex:none;font-size:20px;color:#8d8679}.tag-filter-popup{position:fixed;z-index:130;display:flex;flex-direction:column;overflow:hidden;border:1px solid #ded9cf;border-radius:12px;background:#fffdf8;color:#34312b;box-shadow:0 12px 40px #26231e2b}.tag-filter-popup header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;font-size:15px}.tag-filter-popup header button{border:0;border-radius:4px;background:transparent;font-size:22px;color:#777;cursor:pointer}.tag-search{margin:0 12px 10px;padding:10px;border:1px solid #d3cec4;border-radius:6px;background:white;color:#34312b;font-size:15px;min-width:0}.tag-search:focus{outline:2px solid #8b9e85;outline-offset:1px}.tag-results{overflow:auto;min-height:0;padding:0 6px 8px;overscroll-behavior:contain}.tag-option{display:flex;align-items:center;gap:8px;padding:8px 6px;border-radius:5px;cursor:pointer}.tag-option.highlighted{background:#eeeadf}.tag-option[aria-selected=true]{background:#e8eee5}.check{width:18px;flex:none;color:#53694c}.tag-option small{margin-left:auto;color:#8a8174;font-size:12px}.tag-results p,.tag-filter-popup footer{padding:10px 14px;color:#8b867d;font-size:12px;line-height:1.5}.tag-filter-popup footer{border-top:1px solid #e3ded4}.tag-filter-enter-active,.tag-filter-leave-active{transition:opacity .15s,transform .15s}.tag-filter-enter-from,.tag-filter-leave-to{opacity:0;transform:translateY(-4px)}@media(prefers-reduced-motion:reduce){.tag-filter-enter-active,.tag-filter-leave-active{transition:none}}
</style>
