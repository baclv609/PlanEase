<template>
  <div class="upcoming-events-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold">
        {{ language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events' }}
      </h1>
    </div>

    <!-- Loading state -->
    <a-skeleton v-if="loading" active />

    <!-- Error state -->
    <a-empty
      v-else-if="error"
      :description="error"
      class="my-4"
    >
      <template #extra>
        <a-button type="primary" @click="fetchUpcomingTasks">
          {{ language === 'vi' ? 'Thử lại' : 'Try again' }}
        </a-button>
      </template>
    </a-empty>

    <!-- No events -->
    <a-empty
      v-else-if="!formattedUpcomingTasks.length"
      :description="language === 'vi' ? 'Không có sự kiện sắp tới' : 'No upcoming events'"
      class="my-4"
    />

    <!-- Events list -->
    <template v-else>
      <a-list :data-source="formattedUpcomingTasks" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="flex justify-between w-full items-center">
              <div class="event-details flex-1 mx-3">
                <div class="font-medium">{{ item.title }}</div>
                <div class="text-sm text-gray-500">
                  {{ formatDateTime(item.start_time) }}
                </div>
              </div>
              <a-tag :color="getEventColor(item.priority)">
                {{ item.formattedTime }}
              </a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import moment from 'moment-timezone';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const { language, timeZone, timeFormat } = settingsStore;

const loading = ref(false);
const error = ref(null);
const upcomingTasks = ref([]);

// Format date time
const formatDateTime = (datetime) => {
  moment.tz.setDefault(timeZone);
  const eventTime = moment.utc(datetime).tz(timeZone);
  
  let timeStr;
  if (timeFormat === '12h') {
    timeStr = eventTime.format('hh:mm A');
  } else {
    timeStr = eventTime.format('HH:mm');
  }
  
  const dateStr = eventTime.format('DD/MM/YYYY');
  return `${timeStr} - ${dateStr}`;
};

// Format time from now
const formatTimeFromNow = (datetime) => {
  moment.locale(language);
  moment.tz.setDefault(timeZone);
  
  const now = moment();
  const eventTime = moment.utc(datetime).tz(timeZone);
  
  const diffMinutes = eventTime.diff(now, 'minutes');
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  const isToday = eventTime.isSame(now, 'day');
  const isTomorrow = eventTime.isSame(now.clone().add(1, 'day'), 'day');
  const isOngoing = diffMinutes <= 0 && diffMinutes > -60;

  const formatTime = (time) => {
    if (timeFormat === '12h') {
      return time.format('hh:mm A');
    }
    return time.format('HH:mm');
  };

  const formats = {
    vi: {
      ongoing: 'Đang diễn ra',
      past: (unit, value) => `${Math.abs(value)} ${unit} trước`,
      future: (unit, value) => `${value} ${unit} nữa`,
      today: `Hôm nay ${formatTime(eventTime)}`,
      tomorrow: `Ngày mai ${formatTime(eventTime)}`,
      default: eventTime.format('DD/MM/YYYY ') + formatTime(eventTime),
    },
    en: {
      ongoing: 'Ongoing',
      past: (unit, value) => `${Math.abs(value)} ${unit} ago`,
      future: (unit, value) => `in ${value} ${unit}`,
      today: `Today at ${formatTime(eventTime)}`,
      tomorrow: `Tomorrow at ${formatTime(eventTime)}`,
      default: eventTime.format('MM/DD/YYYY ') + formatTime(eventTime),
    },
  };

  const t = formats[language] || formats.en;

  let result;
  if (isOngoing) {
    result = t.ongoing;
  } else if (diffMinutes < 0) {
    if (diffMinutes > -60) {
      result = t.past(language === "vi" ? "phút" : "minutes", Math.abs(diffMinutes));
    } else if (diffHours > -24) {
      result = t.past(language === "vi" ? "giờ" : "hours", Math.abs(diffHours));
    } else if (diffDays > -7) {
      result = t.past(language === "vi" ? "ngày" : "days", Math.abs(diffDays));
    } else {
      result = t.default;
    }
  } else {
    if (diffMinutes < 60) {
      result = t.future(language === "vi" ? "phút" : "minutes", diffMinutes);
    } else if (diffHours < 24) {
      result = t.future(language === "vi" ? "giờ" : "hours", diffHours);
    } else if (diffDays < 7) {
      result = t.future(language === "vi" ? "ngày" : "days", diffDays);
    } else if (isToday) {
      result = t.today;
    } else if (isTomorrow) {
      result = t.tomorrow;
    } else {
      result = t.default;
    }
  }
  
  return result;
};

// Get event color based on priority
const getEventColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
    default: 'gray'
  };
  return colors[priority?.toLowerCase()] || colors.default;
};

// Fetch upcoming tasks
const fetchUpcomingTasks = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}tasks/upComingTasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response?.data?.code === 200) {
      upcomingTasks.value = response.data.data || [];
    } else {
      throw new Error(response?.data?.message || 'Không thể tải danh sách sự kiện');
    }

  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    
    if (err.response) {
      if (err.response.status === 500) {
        error.value = 'Lỗi máy chủ, vui lòng thử lại sau';
      } else if (err.response.status === 401) {
        error.value = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
      } else {
        error.value = err.response.data?.message || 'Không thể tải danh sách sự kiện';
      }
    } else if (err.request) {
      error.value = 'Không thể kết nối đến máy chủ';
    } else {
      error.value = 'Đã xảy ra lỗi, vui lòng thử lại';
    }

    upcomingTasks.value = [];
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Format upcoming tasks
const formattedUpcomingTasks = computed(() => {
  return upcomingTasks.value.map(task => ({
    ...task,
    formattedTime: formatTimeFromNow(task.start_time)
  }));
});

// Watch for settings changes
watch(
  () => [
    settingsStore.language, 
    settingsStore.timeZone,
    settingsStore.timeFormat
  ],
  async ([newLanguage, newTimezone, newTimeFormat]) => {
    moment.locale(newLanguage);
    moment.tz.setDefault(newTimezone);
    await fetchUpcomingTasks();
  },
  { immediate: true }
);

// Initial fetch
onMounted(async () => {
  await fetchUpcomingTasks();
});
</script>

<style scoped>
.upcoming-events-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-details {
  min-width: 0;
}

.event-details .font-medium {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
