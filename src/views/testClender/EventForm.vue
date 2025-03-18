<script setup>
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // Plugin kéo thả

// Danh sách sự kiện
const events = ref([
  {
    id: "1",
    title: "Họp nhóm (có giờ)",
    start: "2025-03-17T14:30:00",
    end: "2025-03-17T15:30:00",
  },
  {
    id: "2",
    title: "Ngày nghỉ lễ (cả ngày)",
    start: "2025-03-18",
    allDay: true,
  },
]);

// Cấu hình FullCalendar
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  editable: true, // Cho phép kéo thả
  eventDrop: handleEventDrop, // Xử lý sự kiện kéo thả
});

// Xử lý khi kéo thả sự kiện
const handleEventDrop = (info) => {
  const event = info.event;
  const oldStart = info.oldEvent.start; // Ngày giờ cũ
  const newStart = event.start; // Ngày giờ mới

  console.log("📅 Sự kiện được kéo:", event.title);
  console.log("🔹 Ngày giờ cũ:", oldStart.toISOString());
  console.log("🔹 Ngày giờ mới:", newStart.toISOString());

  // 🔹 Nếu sự kiện là cả ngày, giữ nguyên trạng thái allDay
  if (event.allDay) {
    console.log("🔹 Đây là sự kiện cả ngày, không có giờ cụ thể.");
  }

  // 🔹 Nếu sự kiện cũ có giờ nhưng sự kiện mới bị mất giờ (00:00:00), giữ lại giờ cũ
  if (oldStart.getHours() !== 0 || oldStart.getMinutes() !== 0) {
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), oldStart.getSeconds());
  }

  console.log("✅ Ngày giờ sau khi xử lý:", newStart.toISOString());

  // Giả sử gửi API để cập nhật sự kiện
  updateEventInDatabase(event.id, newStart.toISOString());
};

// Giả lập hàm gửi API cập nhật sự kiện
const updateEventInDatabase = (eventId, newDateTime) => {
  console.log(`🔄 Cập nhật sự kiện ${eventId} trên server với thời gian mới: ${newDateTime}`);
};
</script>

<template>
  <div>
    <h2>Lịch Sự Kiện</h2>
    <FullCalendar :options="calendarOptions" :events="events" />
  </div>
</template>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
