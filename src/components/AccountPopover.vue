<!-- Not used -->
<template>
  <div class="relative flex text-left text-[14px]" ref="container">
    <button @click.stop="togglePopover" class="flex items-center p-2 hover:bg-customPurple-200 mx-2 my-3 px-5 rounded-lg transition-timing">
      <img src="/icons/user-avatar-filled.svg" class="w-6 h-6 mr-2" />
      <span>Tracy Wong</span>
    </button>
    <transition name="slide-fade">
      <div
        v-if="isPopoverOpen"
        ref="popover"
        :style="popoverStyle"
        class="absolute w-56 origin-bottom-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div class="p-4 border-b border-gray-200">
          <strong class="block text-gray-900">Tracy Wong</strong>
          <span class="text-gray-500">tracywong117@gmail.com</span>
        </div>
        <div class="py-1 flex flex-col">
          <div class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
            <span>Account Setting</span>
          </div>
          <div class="block items-center px-4 py-2 cursor-pointer transition-colors">
            <div class="flex items-center justify-between">
              <span>Theme</span>
              <div class="flex">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="/icons/mode-light.svg">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="/icons/mode-dark.svg">
                <img class="w-[26px] h-[26px] hover:bg-gray-100 px-1 rounded" src="/icons/mode-system.svg">
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
      popoverStyle: {
        left: '0.5rem',
        bottom: '100%',
        marginBottom: '0.5rem'
      }
    };
  },
  methods: {
    togglePopover() {
      this.isPopoverOpen = !this.isPopoverOpen;
      if (this.isPopoverOpen) {
        this.$nextTick(() => {
          this.adjustPopoverPosition();
        });
      }
    },
    handleClickOutside(event) {
      if (this.$refs.popover && !this.$refs.popover.contains(event.target)) {
        this.isPopoverOpen = false;
      }
    },
    adjustPopoverPosition() {
      const container = this.$refs.container.getBoundingClientRect();
      const popover = this.$refs.popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = '0.5rem';
      let bottom = '100%';
      let marginBottom = '0.5rem';

      // Check if popover is too close to the right edge
      if (container.right + popover.width > viewportWidth) {
        left = 'auto';
        this.popoverStyle.right = '0.5rem';
      } else {
        delete this.popoverStyle.right;
      }

      // Check if popover is too close to the top edge
      if (container.top - popover.height < 0) {
        bottom = 'auto';
        marginBottom = '0';
        this.popoverStyle.top = '100%';
        this.popoverStyle.marginTop = '0.5rem';
      } else {
        delete this.popoverStyle.top;
        delete this.popoverStyle.marginTop;
      }

      this.popoverStyle = {
        ...this.popoverStyle,
        left,
        bottom,
        marginBottom
      };
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.adjustPopoverPosition);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.adjustPopoverPosition);
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