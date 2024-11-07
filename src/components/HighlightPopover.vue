<template>
<Popover position="right">
    <template #trigger>
        <button :class="`h-5 w-5 bg-${color}-300 focus:outline-none`"></button>
    </template>
    <div class="p-3">
        <div class="text-gray-800 mb-2">
            <img src="/icons/highlight.svg" class="w-5 h-5 inline-block mr-1" alt="Highlight" />
            Highlight Color
        </div>
        <div class="flex flex-wrap justify-between gap-2">
            <div class="h-5 w-5 border-yellow-500 bg-yellow-300 cursor-pointer" @click="emitColor('yellow')"></div>
            <div class="h-5 w-5 border-red-500 bg-red-300 cursor-pointer" @click="emitColor('red')"></div>
            <div class="h-5 w-5 border-pink-500 bg-pink-300 cursor-pointer" @click="emitColor('pink')"></div>
            <div class="h-5 w-5 border-blue-500 bg-blue-300 cursor-pointer" @click="emitColor('blue')"></div>
            <div class="h-5 w-5 border-green-500 bg-green-300 cursor-pointer" @click="emitColor('green')"></div>
            <div class="h-5 w-5 border-orange-500 bg-orange-300 cursor-pointer" @click="emitColor('orange')"></div>
            <div class="h-5 w-5 border-gray-500 bg-gray-300 cursor-pointer" @click="emitColor('gray')"></div>
            <div class="h-5 w-5 border-purple-500 bg-purple-300 cursor-pointer" @click="emitColor('purple')"></div>
        </div>
    </div>
</Popover>
</template>

<script>
import Popover from './Popover.vue';

export default {
    components: {
        Popover
    },
    props: {
        color: String
    },
    methods: {
        emitColor(color) {
            this.$emit('changeColor', color);
            console.log(color);
        }
    }
};
</script>
