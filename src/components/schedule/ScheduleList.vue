<script setup>
import { defineProps, watch, computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps(["year", "month", "day"]);
const route = useRoute();

const formattedDate = computed(() => `${props.year}-${props.month}-${props.day}`);

watch(
  () => route.params,
  (newParams) => {
    console.log("Cập nhật ngày mới:", newParams);
  },
  { deep: true }
);
</script>

<template>
  <div>
    <h2>Lịch ngày: {{ formattedDate }}</h2>
  </div>
</template>
