<template>
  <div>
    <h2>{{ $t('Schedule List') }}</h2>
    <ScheduleFilter @filter="applyFilter" />
    <ScheduleList :schedules="filteredSchedules" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ScheduleFilter from "@/components/schedule/ScheduleFilter.vue";
import ScheduleList from "@/components/schedule/ScheduleList.vue";

const schedules = ref([]); // Lấy dữ liệu lịch trình từ API
const filteredSchedules = ref(schedules.value);

const applyFilter = (filter) => {
  filteredSchedules.value = schedules.value.filter(
    (schedule) => schedule.date === filter.date
  );
};
</script>
