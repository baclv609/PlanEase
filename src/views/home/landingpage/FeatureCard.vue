<template>
    <div class="space-y-4">
      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <img :src="icon" class="w-6 h-6" alt="" />
      </div>
      <h3 class="text-xl font-semibold">{{ title }}</h3>
      <p class="text-gray-600">{{ description }}</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    description: String,
    icon: String,
  });
  </script>
  