<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const token = localStorage.getItem('access_token');
const dirApi = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const queryParams = route.query;

const calendarDays = ref([]);

// Ngày đang được chọn
const selectedDay = ref(null);

  // Hàm chọn ngày
const selectDay = (day) => {
  console.log(day);
  selectedDay.value = day;
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

    calendarDays.value = response.data.data;
    console.log("✅ Search Results:", calendarDays.value);
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
    <div v-if="calendarDays.length > 0">
        <div v-for="(day, index) in calendarDays" :key="index"
          @click="selectDay(day)"
          class="calendar-row border-b border-gray-200 py-3 px-4 flex items-center cursor-pointer hover:bg-gray-100"
          :class="{ 'bg-blue-100': selectedDay?.start_time === day.start_time }"
        >
          <div class="day-number w-12 font-bold text-xl">{{ new Date(day.start_time).getDate() }}</div>
          <div class="date-info w-40 text-xs text-gray-700">
            <div>THÁNG {{ new Date(day.start_time).getMonth() + 1 }},</div>
            <div>{{ new Date(day.start_time).getFullYear() }}</div>
          </div>
          <div class="status-indicator w-8 flex justify-center">
            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: day.color_code }"></div>
          </div>
          <div class="event-type w-24 text-sm">{{ day.title }}</div>
          <div class="event-description text-sm">{{ day.description }}</div>
        </div>
    
        <!-- Thông tin chi tiết -->
        <div v-if="selectedDay" class="selected-day-info mt-4 p-4 border rounded bg-gray-50">
          <h3 class="text-lg font-bold">Chi tiết ngày {{ new Date(selectedDay.start_time).toLocaleDateString() }}</h3>
          <p><strong>Tiêu đề:</strong> {{ selectedDay.title }}</p>
          <p><strong>Mô tả:</strong> {{ selectedDay.description }}</p>
          <p><strong>Màu:</strong> 
            <span class="inline-block w-4 h-4 rounded-full" :style="{ backgroundColor: selectedDay.color_code }"></span>
          </p>
        </div>
      </div>
    </div>
    <!-- Danh sách ngày -->
</template>

<style scoped></style>