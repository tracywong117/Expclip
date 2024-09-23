<template>
<div :class="`p-6 border-l-4 ${bgColor} ${borderColor}`">
    <div v-if="!quote.Editable">
        <p class="text-lg mb-4 leading-relaxed">{{ quote.Quote }}</p>
    </div>
    <div v-else class="mb-4">
        <textarea v-model="quote.Quote" placeholder="Enter quote" class="w-full p-2 border rounded text-lg"></textarea>
    </div>
    <div class="flex justify-between">
        <div>
            <span class="font-semibold text-gray-800">{{ quote.Book }}</span>
            <span class="ml-2 text-sm text-gray-600">{{ quote.Author }}</span>
        </div>
        <div>
            <span class="text-sm text-gray-500">Page {{ quote.Page }}</span>
            <span class="ml-2 text-sm text-gray-500">{{ formatDate(quote.Datetime) }}</span>
        </div>
    </div>
    <div class="flex justify-between mt-2 items-start">
        <div class="flex">
            <HeartIcon />
            <HighlightPopover :color="quote.Color" @changeColor="updateColor" />
        </div>
        <div class="flex space-x-2 text-[14px]">
            <button v-if="!quote.Editable" @click="quote.Editable = true" class="border border-slate-300 text-slate-800 hover:bg-slate-200 px-3 py-1 rounded">Edit</button>
            <button v-if="quote.Editable" @click="$emit('updateQuote', quote)" class="bg-blue-200 text-blue-800 hover:bg-blue-300 px-3 py-1 rounded">Save</button>
            <button @click="$emit('deleteQuote', quote.id)" class="bg-red-200 text-red-800 hover:bg-red-400 hover:text-red-900 px-3 py-1 rounded">Delete</button>
        </div>
    </div>
</div>
</template>

<script>
import HeartIcon from './HeartIcon.vue';
import HighlightPopover from './HighlightPopover.vue';

export default {
    components: {
        HeartIcon,
        HighlightPopover
    },
    props: {
        quote: Object
    },
    computed: {
        // Computed properties
        borderColor() {
            console.log(`border-${this.quote.Color}-400`);
            return `border-${this.quote.Color}-400`;
        },
        bgColor() {
            console.log(`bg-${this.quote.Color}-50`);
            return `bg-${this.quote.Color}-50`;
        }   
    },
    methods: {
        formatDate(datetime) {
            // Format date logic
        },
        updateColor(newColor) {
            this.quote.Color = newColor; // Update the color based on the event
            console.log("Updated color to", newColor);
        }
    }
};
</script>
