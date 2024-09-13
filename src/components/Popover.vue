<template>
<div class="relative inline-block" ref="container">
    <div @click.stop="togglePopover">
        <slot name="trigger"></slot>
    </div>
    <div v-if="isPopoverOpen" ref="popover" :class="[
          'absolute w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50',
          positionClass
        ]" :style="popoverStyle">
        <slot></slot>
    </div>
</div>
</template>

  
  
<script>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick,
    reactive
} from 'vue';

export default {
    name: 'Popover',
    props: {
        position: {
            type: String,
            default: 'bottom',
            validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
        }
    },
    setup(props) {
        const isPopoverOpen = ref(false);
        const container = ref(null);
        const popover = ref(null);
        const popoverStyle = reactive({
            transform: '',
            top: '',
            left: '',
            right: '',
            bottom: ''
        });

        const togglePopover = () => {
            isPopoverOpen.value = !isPopoverOpen.value;
            if (isPopoverOpen.value) {
                nextTick(() => {
                    // Add a small delay to ensure content is rendered
                    setTimeout(adjustPopoverPosition, 0);
                });
            }
        };

        const handleClickOutside = (event) => {
            if (container.value && !container.value.contains(event.target)) {
                isPopoverOpen.value = false;
            }
        };

        const positionClass = computed(() => {
            switch (props.position) {
                case 'top':
                    return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
                case 'bottom':
                    return 'top-full left-2 transform -translate-x-1/2 mt-2';
                case 'left':
                    return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
                case 'right':
                    return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
                default:
                    return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            }
        });

        const adjustPopoverPosition = () => {
            if (!popover.value || !container.value) return;

            // Reset styles before recalculating
            Object.assign(popoverStyle, {
                transform: '',
                top: '',
                left: '',
                right: '',
                bottom: ''
            });

            nextTick(() => {
                const containerRect = container.value.getBoundingClientRect();
                const popoverRect = popover.value.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let adjustedPosition = props.position;
                let adjustment = {
                    x: 0,
                    y: 0
                };

                // Check if the popover exceeds the viewport boundaries and adjust if necessary
                if (props.position === 'bottom' && popoverRect.bottom > viewportHeight) {
                    adjustedPosition = 'top';
                } else if (props.position === 'top' && popoverRect.top < 0) {
                    adjustedPosition = 'bottom';
                } else if (props.position === 'left' && popoverRect.left < 0) {
                    adjustedPosition = 'right';
                } else if (props.position === 'right' && popoverRect.right > viewportWidth) {
                    adjustedPosition = 'left';
                }

                // Calculate adjustments for horizontal overflow
                if (['top', 'bottom'].includes(adjustedPosition)) {
                    if (popoverRect.left < 0) {
                        adjustment.x = -popoverRect.left;
                    } else if (popoverRect.right > viewportWidth) {
                        adjustment.x = viewportWidth - popoverRect.right;
                    }
                }

                // Calculate adjustments for vertical overflow
                if (['left', 'right'].includes(adjustedPosition)) {
                    if (popoverRect.top < 0) {
                        adjustment.y = -popoverRect.top;
                    } else if (popoverRect.bottom > viewportHeight) {
                        adjustment.y = viewportHeight - popoverRect.bottom;
                    }
                }

                // Apply the adjustments
                popoverStyle.transform = `translate(${adjustment.x}px, ${adjustment.y}px)`;

                // Set the position based on the adjusted position
                switch (adjustedPosition) {
                    case 'top':
                        popoverStyle.bottom = `${containerRect.height}px`;
                        popoverStyle.left = '50%';
                        popoverStyle.transform += ' translate(-50%, 0)';
                        break;
                    case 'bottom':
                        popoverStyle.top = `${containerRect.height}px`;
                        popoverStyle.left = '50%';
                        popoverStyle.transform += ' translate(-50%, 0)';
                        break;
                    case 'left':
                        popoverStyle.right = `${containerRect.width}px`;
                        popoverStyle.top = '50%';
                        popoverStyle.transform += ' translate(0, -50%)';
                        break;
                    case 'right':
                        popoverStyle.left = `${containerRect.width}px`;
                        popoverStyle.top = '50%';
                        popoverStyle.transform += ' translate(0, -50%)';
                        break;
                }
            });
        };

        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
            window.addEventListener('resize', adjustPopoverPosition);
            window.addEventListener('scroll', adjustPopoverPosition);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('resize', adjustPopoverPosition);
            window.removeEventListener('scroll', adjustPopoverPosition);
        });

        return {
            isPopoverOpen,
            container,
            popover,
            togglePopover,
            positionClass,
            popoverStyle
        };
    },
};
</script>
