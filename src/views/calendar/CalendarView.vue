<template>
  <a-card :title="`Lịch trình ngày ${day}/${month}/${year}`">
    <p>Danh sách sự kiện cho ngày này sẽ được hiển thị ở đây.</p>
    <a-button type="primary" @click="goBack">Quay lại</a-button>
  </a-card>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { message } from "ant-design-vue";
import { useCalendarStore } from "@/stores/calendarStore";

const route = useRoute();
const router = useRouter();
const calendarStore = useCalendarStore();

const { year, month, day } = route.params;

// Chuyển thành chuỗi ngày hợp lệ
const selectedDate = computed(() => {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
});

onMounted(async () => {
  await calendarStore.loadEvents(); // Đảm bảo dữ liệu đã được tải từ API

  console.log("selectedDate", selectedDate.value);
  const events = calendarStore.getEventsByDate(selectedDate.value);
  console.log("Sự kiện trong ngày:", events);

  if (events.length === 0) {
    message.info("Không có sự kiện nào trong ngày này");
    // router.push("/calendar"); // Nếu muốn quay lại lịch
  }
});

const goBack = () => {
  router.push("/");
};
</script>
