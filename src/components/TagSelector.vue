<template>
    <div class="w-44 relative">
      <button @click="toggleDropdown" class="flex items-center justify-between w-full p-2 border border-purple-300 rounded bg-white">
        <span class="flex items-center">
          <i class="fas fa-tags mr-2"></i> Tags
        </span>
        <i class="fas fa-caret-down"></i>
      </button>
      <div v-if="dropdownVisible" class="absolute bg-white border border-gray-300 rounded w-full mt-2 z-10">
        <div
          v-for="option in filteredTags"
          :key="option"
          @click="toggleTag(option)"
          class="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          <input
            type="checkbox"
            :checked="selectedTags.includes(option)"
            class="mr-2"
          />
          {{ option }}
        </div>
        <button @click="applyFilter" class="w-full bg-purple-500 text-white py-2 rounded-b">
          Filter
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      tags: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        selectedTags: [],
        dropdownVisible: false,
      };
    },
    computed: {
      filteredTags() {
        return this.tags;
      },
    },
    methods: {
      toggleDropdown() {
        this.dropdownVisible = !this.dropdownVisible;
      },
      toggleTag(tag) {
        if (this.selectedTags.includes(tag)) {
          this.removeTag(tag);
        } else {
          this.selectedTags.push(tag);
        }
      },
      removeTag(tag) {
        this.selectedTags = this.selectedTags.filter((t) => t !== tag);
      },
      applyFilter() {
        this.$emit('update:selectedTags', this.selectedTags);
        this.dropdownVisible = false;
      },
    },
  };
  </script>
  
  <style scoped>
  button {
    outline: none;
  }
  </style>