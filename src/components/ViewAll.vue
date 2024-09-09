<template>
    <router-link
      :to="to"
      class="text-[14px] text-gray-500 cursor-pointer border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 flex items-center"
    >
      <div>View All</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 12h14M12 5l7 7-7 7"
        />
      </svg>
    </router-link>
  </template>
  
  <script>
  export default {
    name: 'ViewAll',
    props: {
      to: {
        type: String,
        required: true
      }
    }
  };
  </script>
