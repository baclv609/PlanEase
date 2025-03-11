<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import EventDetailsModal from './components/EventDetailsModal.vue';
import { DateTime } from 'luxon';
import luxonPlugin from '@fullcalendar/luxon3';
const token = localStorage.getItem('access_token');
const dirApi = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const queryParams = route.query;

const calendarDays = ref([]);

// Ngày đang được chọn
const event = ref({});
const isEventDetailModalVisible = ref(false);
const userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};

// Hàm chọn ngày
const selectDay = (day) => {
  event.value = {
    id: day.id,
    title: day.title,
    uuid: day.uuid,
    user_id: day.user_id,
    start: DateTime.fromFormat(day.start_time, "yyyy-MM-dd HH:mm:ss", { zone: "UTC" }).setZone(userSettings?.timeZone).toJSDate(),
    end: day.endStr,
    end_time: day.end_time,
    timezone: day.timezone_code,
    color: day.color_code,
    is_all_day: day.is_all_day,
    recurrence: day.is_repeat || 'none',
    description: day.description || '',
    attendees: day.attendees,
    is_done: day.is_done,
    is_reminder: day.is_reminder ?? 'none',
    reminder: day.reminder ?? 'none',
    location: day.location,
    info:  {
      extendedProps :{
        freq: day.freq || null,
        type: day.type,
      }
    },
  };

  isEventDetailModalVisible.value = true;
};

// 🔍 Fetch dữ liệu khi component mounted
const fetchSearchResults = async () => {
  try {
    console.log("📌 Query Params:", route.query);

    // Kiểm tra nếu không có params thì không fetch
    if (!route.query) return;

    const response = await axios.get(`${dirApi}tasks/filter`, {
      params: route.query, // Gửi toàn bộ query
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    calendarDays.value = response.data.data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    console.log(calendarDays.value);
  } catch (error) {
    console.error("🔥 Error fetching search results:", error);
  }
};

// Gọi API khi component mounted
onMounted(fetchSearchResults);

// Lắng nghe thay đổi query để cập nhật kết quả tìm kiếm
watch(() => route.query, fetchSearchResults, { deep: true });
</script>

<template>
  <div class="calendar-container bg-white">
    <div v-if="calendarDays.length > 0" class="calendar-container overflow-y-auto max-h-[1000px]">
      <div v-for="(day, index) in calendarDays" :key="index" @click="selectDay(day)"
        class="calendar-row border-b border-gray-200 py-3 px-4 flex items-center cursor-pointer hover:bg-gray-100"
        :class="{ 'bg-blue-100': event?.start_time === day.start_time }">
        <div class="day-number w-12 font-bold text-xl">{{ new Date(day.start_time).getDate() }}</div>
        <div class="date-info w-[100px] text-xs text-gray-700">
          <div>THÁNG {{ new Date(day.start_time).getMonth() + 1 }},</div>
          <div>{{ new Date(day.start_time).getFullYear() }}, {{ new Date(day.start_time).toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase() }}</div>
        </div>
        <div class="status-indicator w-20">
          <div class="text-sm text-gray-700">{{ day.is_all_day ? 'Cả ngày' : 'Cụ thể' }}</div>
        </div>
        <div class="status-indicator w-8">
          <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: day.color_code }"></div>
        </div>
        <div class="event-type w-[250px] text-sm">{{ day.title }}</div>
      </div>

      <!-- Thông tin chi tiết -->
      <EventDetailsModal :isEventDetailModalVisible="isEventDetailModalVisible" :event="event"
        @close="isEventDetailModalVisible = false" />
    </div>

    <div v-else class="text-center py-6 text-gray-500">
      Không tìm thấy lịch nào.
    </div>
  </div>
</template>

<style scoped></style>