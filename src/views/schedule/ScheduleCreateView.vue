<template>
    <div>
      <h2>{{ $t('Schedule List') }}</h2>
      <ul>
        <li v-for="schedule in schedules" :key="schedule.id">
          {{ schedule.title }} - {{ schedule.date }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import scheduleApi from "@/api/scheduleApi";
  
  const schedules = ref([]);
  
  onMounted(async () => {
    try {
      const response = await scheduleApi.getSchedules();
      schedules.value = response.data;
    } catch (error) {
      console.error("Lỗi khi tải lịch trình:", error);
    }
  });
  </script>
  