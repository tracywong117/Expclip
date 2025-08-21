<template>
  <component :is="inline ? 'span' : 'div'" class="popover-wrapper" ref="container">
    <component 
      :is="inline ? 'span' : 'div'" 
      class="popover-trigger" 
      @click.stop="togglePopover"
    >
      <slot name="trigger"></slot>
    </component>
    
    <Teleport to="body">
      <div 
        v-if="isPopoverOpen" 
        ref="popover"
        class="popover-content"
        :style="popoverStyle"
        @click.stop
      >
        <div class="popover-inner">
          <slot></slot>
        </div>
      </div>
    </Teleport>
  </component>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

export default {
  name: 'Popover',
  props: {
    position: {
      type: String,
      default: 'bottom',
      validator: (value) => ['top', 'bottom', 'left', 'right', 'auto'].includes(value)
    },
    offset: {
      type: Number,
      default: 8
    },
    inline: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const isPopoverOpen = ref(false);
    const container = ref(null);
    const popover = ref(null);
    const popoverStyle = ref({});

    const togglePopover = () => {
      isPopoverOpen.value = !isPopoverOpen.value;
    };

    const closePopover = () => {
      isPopoverOpen.value = false;
    };

    const openPopover = () => {
      isPopoverOpen.value = true;
    };

    const calculatePosition = () => {
      if (!container.value || !popover.value) return;

      const triggerRect = container.value.getBoundingClientRect();
      const popoverRect = popover.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let position = props.position;
      let top = 0;
      let left = 0;

      // Auto positioning - find best position
      if (position === 'auto') {
        const spaceAbove = triggerRect.top;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewportWidth - triggerRect.right;

        if (spaceBelow >= popoverRect.height || spaceBelow > spaceAbove) {
          position = 'bottom';
        } else if (spaceAbove >= popoverRect.height) {
          position = 'top';
        } else if (spaceRight >= popoverRect.width) {
          position = 'right';
        } else if (spaceLeft >= popoverRect.width) {
          position = 'left';
        } else {
          position = 'bottom'; // fallback
        }
      }

      // Calculate base position
      switch (position) {
        case 'top':
          top = triggerRect.top - popoverRect.height - props.offset + scrollY;
          left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2 + scrollX;
          break;
        case 'bottom':
          top = triggerRect.bottom + props.offset + scrollY;
          left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2 + scrollX;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2 + scrollY;
          left = triggerRect.left - popoverRect.width - props.offset + scrollX;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2 + scrollY;
          left = triggerRect.right + props.offset + scrollX;
          break;
      }

      // Adjust for viewport boundaries
      if (left < 0) {
        left = props.offset;
      } else if (left + popoverRect.width > viewportWidth) {
        left = viewportWidth - popoverRect.width - props.offset;
      }

      if (top < scrollY) {
        top = scrollY + props.offset;
      } else if (top + popoverRect.height > viewportHeight + scrollY) {
        top = viewportHeight + scrollY - popoverRect.height - props.offset;
      }

      popoverStyle.value = {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999
      };
    };

    const handleClickOutside = (event) => {
      if (container.value && !container.value.contains(event.target) && 
          popover.value && !popover.value.contains(event.target)) {
        isPopoverOpen.value = false;
      }
    };

    const handleScroll = () => {
      if (isPopoverOpen.value) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isPopoverOpen.value) {
        calculatePosition();
      }
    };

    watch(isPopoverOpen, async (newValue) => {
      if (newValue) {
        await nextTick();
        calculatePosition();
      }
    });

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    });

    // Expose methods for parent components
    const exposed = {
      togglePopover,
      closePopover,
      openPopover,
      isOpen: isPopoverOpen
    };

    // For Vue 3 script setup
    if (typeof defineExpose !== 'undefined') {
      defineExpose(exposed);
    }

    return {
      isPopoverOpen,
      container,
      popover,
      togglePopover,
      closePopover,
      openPopover,
      popoverStyle
    };
  }
};
</script>

<style scoped>
.popover-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.popover-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.popover-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-width: 200px;
  max-width: 320px;
}

.popover-inner {
  padding: 12px;
}
</style>