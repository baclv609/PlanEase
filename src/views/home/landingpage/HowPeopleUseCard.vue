<template>
    <div class="text-left flex flex-col items-start">
      <div class="w-16 h-16 mb-4 ml-10">
        <img class="w-full h-full text-teal-500" :src="icon" alt="" />
      </div>
      <h3 class="font-semibold mb-4">{{ title }}</h3>
      <p class="text-gray-600 text-md mb-4">{{ description }}</p>
      <p class="text-gray-600 text-sm">{{ additionalInfo }}</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    description: String,
    additionalInfo: String,
    icon: String,
  });
  </script>
  