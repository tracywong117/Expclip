<template>
  <Dialog :show="show" @update:show="emit('update:show',$event)">
    <div class="modal-head"><div><span>PREFERENCES & DATA</span><h2>Settings</h2></div><button @click="emit('update:show',false)">×</button></div>
    <p class="intro">Manage the collection stored in this browser.</p>
    <section class="setting-section"><div class="section-heading"><span class="setting-icon">▤</span><div><strong>Local storage</strong><small>Your books and highlights stay on this device.</small></div></div><div class="usage"><div><span>Storage used</span><b>{{storageInfo.percentage}}%</b></div><i><em :style="{width:Math.max(1,storageInfo.percentage)+'%'}"></em></i><small>{{formatBytes(storageInfo.used)}} of approximately {{formatBytes(storageInfo.available)}}</small></div><div class="collection-counts"><div><strong>{{booksStore.bookCount}}</strong><span>Books</span></div><div><strong>{{quotesStore.quoteCount}}</strong><span>Highlights</span></div></div></section>
    <section class="setting-row"><div><strong>Backup & restore</strong><small>Download a complete copy, or restore one you made earlier.</small></div><button @click="showBackup=true">Manage data →</button></section>
    <section class="setting-row danger-row"><div><strong>Clear this library</strong><small>Permanently remove every locally stored book and highlight.</small></div><button @click="showClearConfirm=true">Clear data</button></section>
  </Dialog>
  <BackupDialog :show="showBackup" @update:show="showBackup=$event" />
  <Dialog :show="showClearConfirm" @update:show="showClearConfirm=$event">
    <div class="confirm-icon">!</div><div class="confirm-copy"><span>DESTRUCTIVE ACTION</span><h2>Clear your entire library?</h2><p>This will permanently remove <strong>{{booksStore.bookCount}} books</strong> and <strong>{{quotesStore.quoteCount}} highlights</strong> from this browser. This cannot be undone.</p></div><div class="confirm-actions"><button @click="showClearConfirm=false">Keep my library</button><button class="danger-button" :disabled="clearing" @click="clearData">{{clearing?'Clearing…':'Delete everything'}}</button></div>
  </Dialog>
</template>
<script setup>
import { ref,watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useBooksStore } from '@/stores/books'
import { useQuotesStore } from '@/stores/quotes'
import { StorageService } from '@/services/StorageService'
import Dialog from './Dialog.vue'
import BackupDialog from './BackupDialog.vue'
const props=defineProps({show:Boolean}),emit=defineEmits(['update:show'])
const settingsStore=useSettingsStore(),booksStore=useBooksStore(),quotesStore=useQuotesStore()
const storageInfo=ref({used:0,available:0,percentage:0}),showClearConfirm=ref(false),showBackup=ref(false),clearing=ref(false)
const updateStorage=()=>storageInfo.value=StorageService.getStorageInfo()
const formatBytes=bytes=>{if(!bytes)return'0 Bytes';const units=['Bytes','KB','MB','GB'],i=Math.floor(Math.log(bytes)/Math.log(1024));return`${(bytes/1024**i).toFixed(i?1:0)} ${units[i]}`}
const clearData=async()=>{clearing.value=true;booksStore.clearAllBooks();quotesStore.clearAllQuotes();settingsStore.clearAllData();settingsStore.resetToDefaults();clearing.value=false;showClearConfirm.value=false;emit('update:show',false)}
watch(()=>props.show,value=>value&&updateStorage(),{immediate:true})
</script>
<style scoped>
.modal-head{display:flex;justify-content:space-between}.modal-head span,.confirm-copy>span{color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.17em}.modal-head h2,.confirm-copy h2{margin:5px 0 0;font:500 31px Georgia,serif}.modal-head button{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:transparent;color:#77736b;font-size:20px}.intro{margin:10px 0 25px;color:var(--muted);font-size:12px}.setting-section{padding:22px;border:1px solid var(--line);border-radius:9px;background:#f7f4ed}.section-heading{display:flex;align-items:center;gap:13px}.setting-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:#dfe5df;color:#385247}.section-heading strong,.section-heading small,.setting-row strong,.setting-row small{display:block}.section-heading strong,.setting-row strong{font:600 14px Georgia,serif}.section-heading small,.setting-row small{margin-top:4px;color:var(--muted);font-size:10px}.usage{margin-top:20px}.usage>div{display:flex;justify-content:space-between;color:#67635b;font-size:10px}.usage i{height:5px;margin:8px 0;display:block;overflow:hidden;border-radius:5px;background:#dcd6ca}.usage em{height:100%;display:block;background:var(--olive)}.usage>small{color:#959087;font-size:9px}.collection-counts{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.collection-counts>div{padding:13px;border-radius:6px;background:#ebe6db;text-align:center}.collection-counts strong,.collection-counts span{display:block}.collection-counts strong{font:500 24px Georgia,serif}.collection-counts span{margin-top:2px;color:var(--muted);font-size:9px;text-transform:uppercase}.setting-row{padding:22px 3px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:18px}.setting-row button{padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:transparent;color:#4f554f;font-size:10px;font-weight:700;white-space:nowrap}.setting-row button:hover{background:#eee9de}.danger-row{border-bottom:0}.danger-row button{border-color:#ddbbb3;color:#a74836}.confirm-icon{width:48px;height:48px;margin-bottom:20px;display:grid;place-items:center;border-radius:50%;background:#f0dcd6;color:#a94432;font:600 24px Georgia,serif}.confirm-copy p{margin:14px 0 0;color:var(--muted);font-size:12px;line-height:1.65}.confirm-copy p strong{color:#4f4b43}.confirm-actions{margin-top:27px;padding-top:18px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:8px}.confirm-actions button{min-height:39px;padding:0 15px;border:1px solid var(--line);border-radius:6px;background:transparent;font-size:11px;font-weight:700}.confirm-actions .danger-button{border-color:#a94532;background:#a94532;color:white}@media(max-width:500px){.setting-row{align-items:flex-start;flex-direction:column}.setting-row button{width:100%}}
</style>
