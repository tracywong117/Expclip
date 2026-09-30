<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="show" class="dialog-backdrop" @click.self="closeModal">
        <section class="dialog-surface" role="dialog" aria-modal="true"><slot /></section>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
defineProps({show:{type:Boolean,required:true}})
const emit=defineEmits(['update:show'])
const closeModal=()=>emit('update:show',false)
</script>
<style>
.dialog-backdrop{position:fixed;inset:0;z-index:9999;padding:20px;display:grid;place-items:center;background:rgba(23,27,24,.63);backdrop-filter:blur(5px)}.dialog-surface{width:min(680px,100%);max-height:92vh;overflow:auto;padding:30px;border:1px solid rgba(255,255,255,.35);border-radius:12px;background:#fbfaf6;color:#24231f;box-shadow:0 30px 80px rgba(0,0,0,.3)}.dialog-fade-enter-active,.dialog-fade-leave-active{transition:opacity .18s ease}.dialog-fade-enter-from,.dialog-fade-leave-to{opacity:0}@media(max-width:520px){.dialog-backdrop{padding:10px}.dialog-surface{padding:23px}}
</style>
