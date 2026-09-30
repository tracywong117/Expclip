<template>
  <div class="rating-filter">
    <button ref="trigger" type="button" class="rating-trigger" :class="{active:modelValue!=='all',open}" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="listId" @click="toggle" @keydown.down.prevent="openMenu" @keydown.esc.prevent="close(true)">
      <span class="star-symbol" aria-hidden="true">★</span><span>{{selected.label}}</span><span class="chevron" aria-hidden="true">⌄</span>
    </button>
    <Teleport to="body">
      <Transition name="rating-menu">
        <div v-if="open" :id="listId" ref="popup" class="rating-popup" :style="position" role="listbox" aria-label="Filter books by stars" @keydown.esc.stop.prevent="close(true)" @focusout="onFocusOut">
          <div class="rating-caption" role="presentation">FILTER BY RATING</div>
          <button v-for="(option,index) in options" :key="option.value" :ref="el=>optionRefs[index]=el" type="button" role="option" :aria-selected="modelValue===option.value" :tabindex="active===index?0:-1" :class="{chosen:modelValue===option.value}" @focus="active=index" @click="choose(option.value)" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.home.prevent="focusOption(0)" @keydown.end.prevent="focusOption(options.length-1)">
            <span class="option-copy"><span>{{option.label}}</span><small v-if="option.value==='6'">For exceptional books</small></span>
            <span v-if="+option.value>0" class="option-stars" aria-hidden="true">{{'★'.repeat(+option.value)}}</span>
            <span class="check" aria-hidden="true">{{modelValue===option.value?'✓':''}}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import {computed,ref,nextTick,onBeforeUnmount,getCurrentInstance} from 'vue'
const props=defineProps({modelValue:{type:String,default:'all'}})
const emit=defineEmits(['update:modelValue'])
const options=[{value:'all',label:'All ratings'},{value:'0',label:'Unrated'},...Array.from({length:6},(_,i)=>({value:String(i+1),label:`${i+1} ${i===0?'star':'stars'}`}))]
const selected=computed(()=>options.find(option=>option.value===props.modelValue)||options[0])
const open=ref(false),trigger=ref(null),popup=ref(null),position=ref({}),active=ref(0),optionRefs=[]
const listId='rating-filter-'+getCurrentInstance().uid
const reposition=()=>{
  if(!open.value||!trigger.value)return
  const rect=trigger.value.getBoundingClientRect(),width=Math.min(290,window.innerWidth-24)
  const below=window.innerHeight-rect.bottom-12,above=rect.top-12,down=below>=380||below>=above
  position.value={width:width+'px',left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px',maxHeight:Math.max(100,Math.min(440,down?below:above))+'px',...(down?{top:rect.bottom+7+'px'}:{bottom:window.innerHeight-rect.top+7+'px'})}
}
const outside=event=>{if(!popup.value?.contains(event.target)&&!trigger.value?.contains(event.target))close()}
const onScroll=event=>{if(!popup.value?.contains(event.target))reposition()}
const close=(restore=false)=>{open.value=false;document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',onScroll,true);if(restore)trigger.value?.focus()}
const focusOption=index=>{active.value=index;optionRefs[index]?.focus()}
const move=delta=>focusOption((active.value+delta+options.length)%options.length)
const openMenu=async()=>{
  if(open.value)return
  open.value=true;reposition()
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',onScroll,true)
  await nextTick();focusOption(options.indexOf(selected.value))
}
const toggle=()=>open.value?close():openMenu()
const choose=value=>{emit('update:modelValue',value);close(true)}
const onFocusOut=event=>{if(!popup.value?.contains(event.relatedTarget)&&!trigger.value?.contains(event.relatedTarget))close()}
onBeforeUnmount(()=>close())
</script>
<style scoped>
.rating-filter{flex:none}.rating-trigger{display:inline-flex;align-items:center;gap:8px;min-height:34px;padding:0 12px;border:1px solid var(--line);border-radius:17px;background:var(--paper);color:var(--muted);font-size:13px;cursor:pointer;white-space:nowrap}.rating-trigger:hover,.rating-trigger.open{border-color:#b7a174;background:#f7efdd}.rating-trigger.active{background:#f2e6c9;border-color:#d8be87;color:#79551b}.star-symbol{color:#b6812b;font-size:15px}.chevron{font-size:17px;transition:transform .15s}.open .chevron{transform:rotate(180deg)}.rating-popup{position:fixed;z-index:130;padding:7px;border:1px solid #ded8cc;border-radius:12px;background:#fffdf8;color:#34312b;box-shadow:0 12px 35px #27231c26;overflow:auto}.rating-caption{padding:10px 10px 9px;color:#8b8273;font-size:11px;font-weight:700;letter-spacing:.1em}.rating-popup button{display:flex;align-items:center;gap:10px;width:100%;min-height:42px;padding:9px 10px;border:0;border-radius:7px;background:transparent;text-align:left;color:inherit;font-size:14px;cursor:pointer}.rating-popup button:hover,.rating-popup button:focus-visible{background:#f1ece1;outline:none}.rating-popup button.chosen{background:#f4e9d2}.option-copy{flex:1}.option-copy small{display:block;margin-top:4px;color:#8b7754;font-size:11px}.option-stars{color:#b6812b;letter-spacing:1px;font-size:13px}.check{width:15px;color:#866323}.rating-trigger:focus-visible{outline:2px solid #9d7e45;outline-offset:2px}.rating-menu-enter-active,.rating-menu-leave-active{transition:opacity .13s,transform .13s}.rating-menu-enter-from,.rating-menu-leave-to{opacity:0;transform:translateY(-4px)}@media(prefers-reduced-motion:reduce){.chevron,.rating-menu-enter-active,.rating-menu-leave-active{transition:none}}
</style>
