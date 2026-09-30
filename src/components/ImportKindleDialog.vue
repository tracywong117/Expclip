<template>
  <Dialog :show="isOpen" @update:show="handleClose">
    <div class="modal-head"><div><span>IMPORT FROM KINDLE</span><h2>Bring in your highlights</h2></div><button @click="close">×</button></div>
    <p class="intro">Upload the <strong>My Clippings.txt</strong> file from your Kindle. We’ll organize the books and passages automatically.</p>
    <label class="drop-zone" :class="{selected:selectedFile,dragging:dragDepth>0}" @dragenter.prevent.stop="handleDragEnter" @dragover.prevent.stop="handleDragOver" @dragleave.prevent.stop="handleDragLeave" @drop.prevent.stop="handleDrop">
      <input type="file" accept=".txt,text/plain" :disabled="isUploading" @change="handleFileUpload">
      <span class="file-icon">↥</span>
      <template v-if="dragDepth>0"><strong>Drop your clipping file here</strong><small>Release to select your file</small><em>One TXT file at a time</em></template>
      <template v-else-if="selectedFile"><strong>{{ fileName }}</strong><small>{{ formatSize(selectedFile.size) }} · Ready to import</small><em>Choose a different file</em></template>
      <template v-else><strong>Choose your clipping file</strong><small>Drop it here or click to browse</small><em>TXT files only</em></template>
    </label>
    <div class="privacy-note"><span>◆</span><p><strong>Private and local</strong>Your file is processed in this browser and is never uploaded.</p></div>
    <div v-if="isUploading" class="progress"><div><span>Importing your reading history…</span><b>{{uploadProgress}}%</b></div><i><em :style="{width:uploadProgress+'%'}"></em></i></div>
    <div v-if="message" role="status" :class="['message',success?'success':'error']">{{message}}</div>
    <div class="modal-footer"><button class="cancel" @click="close">Cancel</button><button class="submit" :disabled="!selectedFile||isUploading" @click="uploadFile">{{isUploading?'Importing…':'Import highlights'}}</button></div>
  </Dialog>
</template>
<script setup>
import { ref,watch,onBeforeUnmount } from 'vue'
import { useDataProcessorStore } from '@/stores'
import Dialog from './Dialog.vue'
const props=defineProps({isOpen:Boolean}),emit=defineEmits(['close','import-success','import-error']),dataProcessor=useDataProcessorStore()
const fileName=ref(''),selectedFile=ref(null),uploadProgress=ref(0),isUploading=ref(false),timer=ref(null),message=ref(''),success=ref(false)
const dragDepth=ref(0)
const selectFiles=files=>{
  if(isUploading.value||!files?.length)return
  success.value=false
  if(files.length!==1||!(/\.txt$/i.test(files[0].name)||files[0].type==='text/plain')){
    selectedFile.value=null;fileName.value=''
    message.value=files.length!==1?'Please choose one clipping file at a time.':'Please choose a TXT clipping file.'
    return
  }
  selectedFile.value=files[0];fileName.value=files[0].name;message.value=''
}
const handleFileUpload=e=>{selectFiles(e.target.files);e.target.value=''}
const handleDragEnter=()=>{if(!isUploading.value)dragDepth.value++}
const handleDragOver=e=>{if(e.dataTransfer)e.dataTransfer.dropEffect=isUploading.value?'none':'copy'}
const handleDragLeave=()=>{dragDepth.value=Math.max(0,dragDepth.value-1)}
const handleDrop=e=>{dragDepth.value=0;selectFiles(e.dataTransfer?.files)}
const formatSize=bytes=>bytes<1024?`${bytes} B`:`${(bytes/1024).toFixed(1)} KB`
const uploadFile=async()=>{if(!selectedFile.value||isUploading.value)return;isUploading.value=true;uploadProgress.value=8;message.value='';timer.value=setInterval(()=>{if(uploadProgress.value<88)uploadProgress.value+=4},80);try{const content=await selectedFile.value.text();const result=await dataProcessor.parseKindleClippings(content);uploadProgress.value=100;success.value=true;message.value=`Imported ${result.quotesProcessed} highlights from ${result.booksProcessed} books.${result.duplicatesSkipped ? ` Skipped ${result.duplicatesSkipped} exact duplicate${result.duplicatesSkipped===1?'':'s'}.` : ''}`;emit('import-success',{result,message:message.value});setTimeout(close,700)}catch(error){success.value=false;message.value='That file could not be imported. Check that it is a valid Kindle clipping file.';emit('import-error',{error,message:message.value})}finally{clearInterval(timer.value);isUploading.value=false}}
const reset=()=>{clearInterval(timer.value);dragDepth.value=0;fileName.value='';selectedFile.value=null;uploadProgress.value=0;isUploading.value=false;message.value=''}
const close=()=>{reset();emit('close')}
const handleClose=value=>{if(!value)close()}
watch(()=>props.isOpen,value=>!value&&reset())
onBeforeUnmount(()=>clearInterval(timer.value))
</script>
<style scoped>
.drop-zone.dragging{border:2px dashed var(--olive);background:#e5ecdf;box-shadow:0 0 0 4px #52634e18}.drop-zone.dragging .file-icon{transform:translateY(-4px)}.file-icon{transition:transform .2s}
.modal-head{display:flex;justify-content:space-between}.modal-head span{color:var(--accent);font-size:9px;font-weight:800;letter-spacing:.17em}.modal-head h2{margin:5px 0 0;font:500 31px Georgia,serif}.modal-head button{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:transparent;color:#77736b;font-size:20px}.intro{max-width:530px;margin:11px 0 25px;color:var(--muted);font-size:12px;line-height:1.6}.intro strong{color:#4f4b43}.drop-zone{min-height:205px;padding:28px;border:1px dashed #aaa397;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#f7f4ed;text-align:center;cursor:pointer;transition:.2s}.drop-zone:hover,.drop-zone.selected{border-color:var(--olive);background:#f2f2e9}.drop-zone input{display:none}.file-icon{width:48px;height:48px;margin-bottom:15px;display:grid;place-items:center;border-radius:50%;background:#dfe4dc;color:#3e584d;font-size:24px}.drop-zone strong{font:600 16px Georgia,serif}.drop-zone small{margin-top:5px;color:var(--muted);font-size:10px}.drop-zone em{margin-top:17px;color:var(--accent);font:normal 10px sans-serif;font-weight:700}.privacy-note{margin-top:15px;padding:13px 15px;display:flex;gap:10px;border-radius:7px;background:#ebe6da}.privacy-note>span{color:var(--olive);font-size:9px}.privacy-note p{margin:0;color:var(--muted);font-size:10px;line-height:1.45}.privacy-note strong{display:block;color:#504d46}.progress{margin-top:16px}.progress>div{display:flex;justify-content:space-between;color:var(--muted);font-size:10px}.progress i{height:4px;margin-top:7px;display:block;border-radius:4px;background:#ded9ce;overflow:hidden}.progress em{height:100%;display:block;background:var(--accent)}.message{margin-top:14px;padding:11px;border-radius:6px;font-size:10px}.message.success{background:#e3ece4;color:#3b6545}.message.error{background:#f3dfd9;color:#9a4332}.modal-footer{margin-top:24px;padding-top:18px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:8px}.modal-footer button{min-height:39px;padding:0 16px;border-radius:6px;font-size:11px;font-weight:700}.cancel{border:1px solid var(--line);background:transparent}.submit{border:1px solid var(--accent);background:var(--accent);color:white}.submit:disabled{opacity:.4;cursor:not-allowed}
</style>
