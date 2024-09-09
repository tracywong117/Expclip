<template>
  <div class="relative flex text-left text-[14px]">
    <button @click.stop="togglePopover" class="flex items-center p-3 hover:bg-lime-100 mx-5 px-5 rounded-full border w-full transition-timing">
      <img src="/icons/user-avatar-filled.svg" class="w-7 h-7 mr-3" />
      <span>Account</span>
    </button>
    <transition name="slide-fade">
      <div
        v-if="isPopoverOpen"
        ref="popover"
        class="absolute left-8 bottom-full mb-2 w-56 origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div class="p-4 border-b border-gray-200">
          <strong class="block text-gray-900">Tracy Wong</strong>
          <span class="text-gray-500">tracywong117@gmail.com</span>
        </div>
        <div class="py-1 flex flex-col">
          <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
            <span>Account Setting</span>
          </div>
          <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
            <span>Help</span>
          </div>
          <div class="block items-center px-4 py-2 cursor-pointer transition-colors">
            <div class="flex items-center justify-between">
              <span>Theme</span>
              <div class="flex">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="icons/mode-light.svg">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="icons/mode-dark.svg">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="icons/mode-system.svg">
              </div>
            </div>
          </div>
        </div>
        <div
          class="px-4 py-2 border-t border-gray-200 cursor-pointer hover:bg-gray-100 text-center transition-colors"
        >
          Log out
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPopoverOpen: false,
    };
  },
  methods: {
    togglePopover() {
      this.isPopoverOpen = !this.isPopoverOpen;
    },
    handleClickOutside(event) {
      if (this.$refs.popover && !this.$refs.popover.contains(event.target)) {
        this.isPopoverOpen = false;
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
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