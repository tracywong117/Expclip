<template>
  <Teleport to="body">
    <div
      v-if="show"
      @click.self="closeModal"
      class="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-[9999]"
    >
      <div
        class="bg-white rounded-lg shadow-2xl max-w-[90vw] w-full sm:max-w-lg p-6 relative z-[10000]"
      >
        <slot></slot>
      </div>
    </div>
  </Teleport>
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