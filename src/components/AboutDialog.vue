<template>
  <Dialog :show="isOpen" @update:show="handleClose">
    <div class="modal-head"><div><span>ABOUT THE APP</span><h2>Made for the margins.</h2></div><button @click="close">×</button></div>
    <div class="about-hero"><img class="about-logo" :src="logoUrl" alt="Expclip logo" width="64" height="64"><p>Expclip is a quiet home for the sentences, ideas, and books you want to carry forward.</p></div>
    <div class="principles"><article><span>01</span><div><strong>Private by design</strong><p>Your library stays in this browser. There is no account, server, or tracking layer.</p></div></article><article><span>02</span><div><strong>Built for Kindle</strong><p>Bring in highlights from <em>My Clippings.txt</em>, or capture passages by hand.</p></div></article><article><span>03</span><div><strong>Yours to take</strong><p>Search, organize, back up, and export the collection whenever you like.</p></div></article></div>
    <footer><span>EXPCLIP · VERSION 1.0</span><div><a href="https://github.com/tracywong117/Expclip" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="mailto:tracywong117@gmail.com">Contact</a></div></footer>
  </Dialog>
</template>
<script setup>
import logoUrl from '@/assets/expclip-logo-orange.png'
import Dialog from './Dialog.vue'
defineProps({isOpen:Boolean})
const emit=defineEmits(['close'])
const close=()=>emit('close')
const handleClose=value=>{if(!value)close()}
</script>
<style scoped>
.about-logo{width:64px;height:64px;object-fit:contain;flex:none}
.modal-head{display:flex;justify-content:space-between}.modal-head span{color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.17em}.modal-head h2{margin:5px 0 0;font:500 31px Georgia,serif}.modal-head button{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:transparent;color:#77736b;font-size:20px}.about-hero{margin:28px 0;padding:25px;display:flex;align-items:center;gap:22px;border-radius:9px;background:#263a34;color:#f7f3e9}.about-mark{width:55px;height:55px;flex:none;display:grid;place-items:center;border-radius:13px 13px 13px 4px;background:var(--accent);font:600 31px Georgia,serif}.about-hero p{max-width:440px;margin:0;font:400 19px/1.45 Georgia,serif}.principles{display:grid;gap:0}.principles article{padding:18px 3px;display:flex;gap:18px;border-top:1px solid var(--line)}.principles article>span{color:#aaa59b;font:italic 13px Georgia,serif}.principles strong{font:600 14px Georgia,serif}.principles p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.principles em{font-style:normal;color:#554f45}footer{margin-top:8px;padding-top:18px;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:#928e85;font-size:9px;letter-spacing:.09em}footer div{display:flex;gap:15px}footer a:hover{color:var(--accent)}@media(max-width:480px){.about-hero{align-items:flex-start;flex-direction:column}.about-hero p{font-size:17px}}
</style>
