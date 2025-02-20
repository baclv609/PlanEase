<script setup>
import { ref, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import { useCalendar } from "../../composables/useCalendar";
import EventModal from "./components/EventModal.vue";


// State lưu trữ danh sách sự kiện
const events = ref([
  {
    id: 1,
    user_id: 9,
    color_id: 2,
    timezone_id: 1,
    title: "Complete the project report.",
    description:
      "This task involves completing the project report by the end of the week.",
    start_time: "2025-02-17 15:58:05",
    end_time: "2025-02-17 16:58:05",
    is_reminder: 1,
    reminder: [
      {
        type: "email",
        set_time: 5,
      },
    ],
    is_done: 0,
    user_ids: [
      {
        role: "editor",
        status: 1,
        user_id: 2,
      },
      {
        role: "viewer",
        status: 1,
        user_id: 3,
      },
    ],
    location: "Office",
    type: "task",
    is_all_day: 0,
    is_repeat: 1,
    is_busy: 0,
    path: null,
    exclude_time: ["2025-02-17"],
    deleted_at: null,
    created_at: null,
    updated_at: null,
    color_code: "#00FF00",
    timezone_code: "UTC-12:00",
    rrule: {
      date_space: "weekly",
      repeat_space: 1,
      end_repeat: "2025-05-17",
      total_repeat_time: null,
      day_of_week: ["mo", "we", "fr"],
      day_of_month: [1, 15, 24],
      by_month: [1, 6, 12],
    },
  },
  // Các đối tượng khác trong mảng sẽ được liệt kê ở đây
]); // Sẽ được cập nhật từ API sau


const showModal = ref(false);
const selectedEvent = ref(null);
const isModalVisible = ref(false);

const { calendarKey, calendarOptions, handleDateClick, handleEventClick } = useCalendar(
  events,
  showModal,
  selectedEvent,
  isModalVisible
);

// Theo dõi thay đổi trong `calendarOptions`
watch(calendarOptions, (newOptions) => {
  console.log("Updated Calendar Options:", newOptions);
});
</script>

<template>
  <div>
    <a-button type="primary" @click="showModal = true">Thêm Sự Kiện</a-button>

    <FullCalendar :key="calendarKey" :options="calendarOptions" />

    <EventModal :visible="isModalVisible" :event="selectedEvent" @save="saveEvent" @cancel="handleCancel" />
  </div>
</template>

