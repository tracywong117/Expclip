<template>
  <div class="relative flex text-left text-[14px]">
    <button @click="showBackupDialog = true" class="flex items-center p-2 hover:bg-customPurple-200 mx-2 my-3 px-5 rounded-lg transition-timing">
      <img src="/icons/data.svg" class="w-5 h-5 mr-2" />
      <span>Data</span>
    </button>
    
    <!-- Backup Dialog -->
    <BackupDialog :show="showBackupDialog" @update:show="showBackupDialog = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackupDialog from './BackupDialog.vue'

const showBackupDialog = ref(false)
</script>

<style scoped>
.transition-timing {
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  opacity: 0;
  transform: scale(1);
}
</style>