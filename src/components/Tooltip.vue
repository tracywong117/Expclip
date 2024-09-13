<template>
    <div class="relative inline-block" ref="container">
      <div @click="handleClick">
        <slot></slot>
      </div>
      <transition name="fade">
        <div
          v-show="isVisible"
          ref="tooltip"
          :class="[
            'absolute z-50 px-4 py-1 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-nowrap',
            positionClass
          ]"
        >
          <slot name="content"></slot>
          <div
            :class="[
              'absolute w-2 h-2 bg-gray-800 transform rotate-45',
              arrowPositionClass
            ]"
          ></div>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  
  export default {
    props: {
      position: {
        type: String,
        default: 'auto',
        validator: (value) => ['top', 'bottom', 'left', 'right', 'auto'].includes(value)
      }
    },
    setup(props) {
      const isVisible = ref(false);
      const container = ref(null);
      const tooltip = ref(null);
      const currentPosition = ref(props.position);
      let hoverTimeout = null;
      let canTrigger = ref(true);
  
      const showTooltip = () => {
        if (!canTrigger.value) return;
        hoverTimeout = setTimeout(() => {
          isVisible.value = true;
          if (props.position === 'auto') {
            updatePosition();
          }
        }, 500); // 1 second delay
      };
  
      const hideTooltip = () => {
        clearTimeout(hoverTimeout);
        isVisible.value = false;
        canTrigger.value = true;
      };
  
      const handleClick = () => {
        clearTimeout(hoverTimeout);
        isVisible.value = false;
        canTrigger.value = false;
      };
  
      const updatePosition = () => {
        if (!container.value || !tooltip.value) return;
  
        const containerRect = container.value.getBoundingClientRect();
        const tooltipRect = tooltip.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
  
        const spaceTop = containerRect.top;
        const spaceBottom = viewportHeight - containerRect.bottom;
        const spaceLeft = containerRect.left;
        const spaceRight = viewportWidth - containerRect.right;
  
        if (spaceTop > tooltipRect.height && spaceTop >= Math.max(spaceBottom, spaceLeft, spaceRight)) {
          currentPosition.value = 'top';
        } else if (spaceBottom > tooltipRect.height && spaceBottom >= Math.max(spaceTop, spaceLeft, spaceRight)) {
          currentPosition.value = 'bottom';
        } else if (spaceLeft > tooltipRect.width && spaceLeft >= Math.max(spaceTop, spaceBottom, spaceRight)) {
          currentPosition.value = 'left';
        } else {
          currentPosition.value = 'right';
        }
      };
  
      const positionClass = computed(() => {
        switch (currentPosition.value) {
          case 'top': return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2';
          case 'bottom': return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2';
          case 'left': return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2';
          case 'right': return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2';
          default: return '';
        }
      });
  
      const arrowPositionClass = computed(() => {
        switch (currentPosition.value) {
          case 'top': return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
          case 'bottom': return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
          case 'left': return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2';
          case 'right': return 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2';
          default: return '';
        }
      });
  
      onMounted(() => {
        if (container.value) {
          container.value.addEventListener('mouseenter', showTooltip);
          container.value.addEventListener('mouseleave', hideTooltip);
        }
      });
  
      onBeforeUnmount(() => {
        if (container.value) {
          container.value.removeEventListener('mouseenter', showTooltip);
          container.value.removeEventListener('mouseleave', hideTooltip);
        }
        clearTimeout(hoverTimeout);
      });
  
      return {
        isVisible,
        container,
        tooltip,
        positionClass,
        arrowPositionClass,
        handleClick
      };
    }
  };
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>