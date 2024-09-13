<template>
    <div v-if="show" @click.self="closeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white m-15 p-5 rounded-lg shadow-xl max-w-[50vw]">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: {
        type: Boolean,
        required: true
      }
    },
    methods: {
      closeModal() {
        this.$emit('update:show', false);
      }
    }
  }
  </script>