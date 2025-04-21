<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import EventDetailsModal from './components/EventDetailsModal.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

import { useSettingsStore } from '@/stores/settingsStore';
// Cấu hình dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const settingsStore = useSettingsStore();

const settingTimezone = computed(() => settingsStore.timeZone);
const userTimezone = computed(() => settingTimezone.value);

const token = localStorage.getItem('access_token');
const dirApi = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const queryParams = route.query;

const calendarDays = ref([]);

// Ngày đang được chọn
const event = ref({});
const isEventDetailModalVisible = ref(false);
const userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};

// Hàm format dữ liệu
const formatEventData = (data) => {
  return data.map(event => {
    // Parse thời gian từ UTC sang múi giờ của người dùng
    const startDateTime = dayjs.utc(event.start_time).tz(userSettings?.timeZone || 'Asia/Ho_Chi_Minh');
    const endDateTime = dayjs.utc(event.end_time).tz(userSettings?.timeZone || 'Asia/Ho_Chi_Minh');
    
    // Format time range string
    let timeRangeStr = '';
    if (event.is_all_day) {
      timeRangeStr = 'Cả ngày';
    } else {
      const isSameDay = startDateTime.isSame(endDateTime, 'day');
      if (isSameDay) {
        timeRangeStr = `${startDateTime.format('HH:mm')} - ${endDateTime.format('HH:mm')}`;
      } else {
        timeRangeStr = `${startDateTime.format('DD/MM HH:mm')} - ${endDateTime.format('DD/MM HH:mm')}`;
      }
    }

    return {
      ...event,
      formattedStartDate: startDateTime.format('DD/MM/YYYY'),
      formattedEndDate: endDateTime.format('DD/MM/YYYY'),
      formattedTimeRange: timeRangeStr,
      formattedWeekday: startDateTime.format('ddd').toUpperCase(),
      formattedMonth: startDateTime.format('MM'),
      formattedYear: startDateTime.format('YYYY'),
      displayDate: startDateTime.format('D'),
      status: event.is_done ? 'Đã hoàn thành' : 'Chưa hoàn thành',
      reminderText: event.is_reminder ? 'Có nhắc nhở' : 'Không nhắc nhở',
      colorStyle: {
        backgroundColor: event.color_code,
        borderColor: event.color_code
      }
    };
  }).sort((a, b) => dayjs.utc(a.start_time).valueOf() - dayjs.utc(b.start_time).valueOf());
};

// Hàm chọn ngày
const selectDay = (day) => {
  const startDateTime = dayjs.utc(day.start_time).tz(userSettings?.timeZone || 'Asia/Ho_Chi_Minh');
  const endDateTime = dayjs.utc(day.end_time).tz(userSettings?.timeZone || 'Asia/Ho_Chi_Minh');

  event.value = {
    id: day.id,
    title: day.title,
    uuid: day.uuid,
    description: day.description,
    user_id: day.user_id,
    type: day.type,
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
    timezone: day.timezone_code,
    tag_id: day.tag_id,
    tag_name: day.tag_name,
    allDay: day.is_all_day === 1,
    backgroundColor: day.color_code || '#3788d8',
    tag_color_code: day.tag_color_code,
    color: day.color_code,
    default_permission: day.default_permission,
    borderColor: day.tag_color_code || day.color_code,
    location: day.location,
    is_done: day.is_done,
    is_all_day: day.is_all_day,
    recurrence: day.is_repeat,
    attendees: day.attendees || [],
    info: {
      extendedProps: {
        parent_id: day.parent_id || null,
        end_time: day.end_time,
        start_time: day.start_time,
        recurrence: day.is_repeat ?? 0,
        is_reminder: day.is_reminder === 1,
        reminder: day.reminder || [],
        attendees: day.attendees || [],
        is_done: day.is_done === 1,
        is_busy: day.is_busy === 1,
        freq: day.rrule?.freq ?? null,
        interval: day.rrule?.interval || 1,
        until: day.rrule?.until ? day.rrule.until.replace(' ', 'T') : null,
        count: day.rrule?.count || null,
        byweekday: day.rrule?.byweekday || null,
        bymonth: day.rrule?.bymonth || null,
        bymonthday: day.rrule?.bymonthday || null,
        attachments: [],
        is_private: day.is_private ? true : false,
        created_at: day.created_at || new Date().toISOString(),
        updated_at: day.updated_at || new Date().toISOString()
      },
    },
    extendedProps: {
      parent_id: day.parent_id || null,
      end_time: day.end_time,
      start_time: day.start_time,
      recurrence: day.is_repeat ?? 0,
      is_reminder: day.is_reminder === 1,
      reminder: day.reminder || [],
      attendees: day.attendees || [],
      is_done: day.is_done === 1,
      is_busy: day.is_busy === 1,
      freq: day.rrule?.freq ?? null,
      interval: day.rrule?.interval || 1,
      until: day.rrule?.until ? day.rrule.until.replace(' ', 'T') : null,
      count: day.rrule?.count || null,
      byweekday: day.rrule?.byweekday || null,
      bymonth: day.rrule?.bymonth || null,
      bymonthday: day.rrule?.bymonthday || null,
      attachments: [],
      is_private: day.is_private ? true : false,
      created_at: day.created_at || new Date().toISOString(),
      updated_at: day.updated_at || new Date().toISOString()
    },
  };

  console.log(event.value);
  isEventDetailModalVisible.value = true;
};

// 🔍 Fetch dữ liệu khi component mounted
const fetchSearchResults = async () => {
  try {
    // Kiểm tra nếu không có params thì không fetch
    if (!route.query) return;

    const response = await axios.get(`${dirApi}tasks/filter`, {
      params: route.query,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Format dữ liệu trước khi gán
    calendarDays.value = formatEventData(response.data.data);
    console.log("rawEvent: ",calendarDays.value);
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
        :class="{ 'bg-blue-100': dayjs().isSame(day.start_time, 'day') }">
        
        <!-- Ngày -->
        <div class="day-number w-12 font-bold text-xl">{{ day.displayDate }}</div>
        
        <!-- Thông tin ngày tháng -->
        <div class="date-info w-[100px] text-xs text-gray-700">
          <div>THÁNG {{ day.formattedMonth }},</div>
          <div>{{ day.formattedYear }}, {{ day.formattedWeekday }}</div>
        </div>
        
        <!-- Thời gian bắt đầu - kết thúc -->
        <div class="time-info w-[180px]">
          <div class="text-sm text-gray-700">
            <span class="inline-flex items-center">
              <i class="far fa-clock mr-1"></i>
              {{ day.formattedTimeRange }}
            </span>
          </div>
        </div>
        
        <!-- Màu sắc và trạng thái -->
        <div class="status-wrapper flex items-center space-x-2 w-[100px]">
          <div class="w-3 h-3 rounded-full" :style="day.colorStyle"></div>
        </div>
        
        <!-- Tiêu đề sự kiện -->
        <div class="event-info flex-grow">
          <div class="event-type text-sm font-medium">{{ day.title }}</div>
        </div>
        
        <!-- Icons -->
        <div class="icons-wrapper flex items-center space-x-2 w-[60px]">
          <!-- Icon nhắc nhở -->
          <div v-if="day.is_reminder" class="text-blue-500">
            <i class="fas fa-bell"></i>
          </div>
          <!-- Icon lặp lại -->
          <div v-if="day.is_repeat" class="text-green-500">
            <i class="fas fa-redo-alt"></i>
          </div>
        </div>
      </div>

      <!-- Modal chi tiết sự kiện -->
      <EventDetailsModal 
        :isEventDetailModalVisible="isEventDetailModalVisible" 
        :event="event"
        @close="isEventDetailModalVisible = false" 
      />
    </div>

    <!-- Hiển thị khi không có dữ liệu -->
    <div v-else class="text-center py-6 text-gray-500">
      Không tìm thấy lịch nào.
    </div>
  </div>
</template>

<style scoped>

</style>