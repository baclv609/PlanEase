<template>
  <div class="schedule-item">
    <h3>{{ schedule.title }}</h3>
    <p>{{ schedule.date }}</p>
    <button @click="$emit('edit', schedule)">Chỉnh sửa</button>
  </div>
</template>

<script setup>
defineProps({ schedule: Object });
</script>

<style scoped>
.schedule-item {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
}
</style>
