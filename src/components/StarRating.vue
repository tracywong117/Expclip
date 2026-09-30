<template>
  <div class="star-rating" :class="{'six-stars':rating===6}" role="group" :aria-label="label">
    <button v-for="star in visibleStars(rating)" :key="star" type="button"
      :class="{filled:star<=rating,bonus:star===6}" :aria-pressed="star===rating"
      :aria-label="star===rating?'Clear rating':`Rate ${star} stars`"
      :title="star===rating?'Click again to clear rating':star===6?'An exceptional book · 6 stars':`${star} stars`"
      @click="emit('update:modelValue',nextRating(rating,star))">{{star<=rating?'★':'☆'}}</button>
    <small v-if="showValue">{{rating===6?'6 stars · exceptional':rating?`${rating} / 5`:'Not rated'}}</small>
  </div>
</template>
<script setup>
import {computed} from 'vue'
import {normalizeRating,visibleStars,nextRating} from '@/utils/bookRating'
const props=defineProps({modelValue:{type:Number,default:0},label:{type:String,default:'Book rating'},showValue:{type:Boolean,default:false}})
const emit=defineEmits(['update:modelValue'])
const rating=computed(()=>normalizeRating(props.modelValue))
</script>
<style scoped>
.star-rating{display:inline-flex;align-items:center;gap:2px;white-space:nowrap}.star-rating button{display:grid;place-items:center;width:24px;height:32px;padding:0;border:0;border-radius:4px;background:transparent;color:#9b9589;font-size:21px;line-height:1;cursor:pointer}.star-rating button.filled{color:#b8791e}.star-rating button:hover{background:#e8c88938;color:#a26913}.star-rating button:focus-visible{outline:2px solid #a26913;outline-offset:1px}.star-rating button.bonus{margin-left:5px;color:#ac751e}.six-stars button{color:#ad751c;text-shadow:0 0 9px #efc86c70}.star-rating small{margin-left:8px;color:var(--muted);font-size:12px}
</style>
