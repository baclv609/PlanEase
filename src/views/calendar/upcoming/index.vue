<template>
  <div class="upcoming-events-page">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">
          {{ language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events' }}
        </h1>
        <div class="flex flex-wrap gap-2 items-center">
          <a-input-search v-model:value="filters.search"
            :placeholder="language === 'vi' ? 'Tìm kiếm sự kiện...' : 'Search events...'" @search="handleSearch"
            class="w-48" size="small" />
          <a-button type="primary" @click="resetFilters" size="small">
            {{ language === 'vi' ? 'Đặt lại' : 'Reset' }}
          </a-button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filters flex flex-wrap gap-4 items-center">


        <!-- <a-select
          v-model:value="filters.priority"
          :placeholder="language === 'vi' ? 'Mức độ ưu tiên' : 'Priority'"
          class="w-40"
          allow-clear
        >
          <a-select-option value="high">
            {{ language === 'vi' ? 'Cao' : 'High' }}
          </a-select-option>
          <a-select-option value="medium">
            {{ language === 'vi' ? 'Trung bình' : 'Medium' }}
          </a-select-option>
          <a-select-option value="low">
            {{ language === 'vi' ? 'Thấp' : 'Low' }}
          </a-select-option>
        </a-select> -->

        <!-- <a-select
          v-model:value="filters.status"
          :placeholder="language === 'vi' ? 'Trạng thái' : 'Status'"
          class="w-40"
          allow-clear
        >
          <a-select-option value="busy">
            {{ language === 'vi' ? 'Bận' : 'Busy' }}
          </a-select-option>
          <a-select-option value="free">
            {{ language === 'vi' ? 'Rảnh' : 'Free' }}
          </a-select-option>
        </a-select> -->


      </div>
    </div>

    <!-- Events Container -->
    <div class="events-container">
      <!-- Loading state -->
      <a-skeleton v-if="loading" active />

      <!-- Error state -->
      <a-empty v-else-if="error" :description="error" class="my-4">
        <template #extra>
          <a-button type="primary" @click="fetchUpcomingTasks" size="small">
            {{ language === 'vi' ? 'Thử lại' : 'Try again' }}
          </a-button>
        </template>
      </a-empty>

      <!-- No events -->
      <a-empty v-else-if="!filteredTasks.length"
        :description="language === 'vi' ? 'Không có sự kiện sắp tới' : 'No upcoming events'" class="my-4" />

      <!-- Events list -->
      <template v-else>
        <div class="scrollable-list" style="max-height: calc(100vh - 227px); overflow-y: auto;">
          <a-list :data-source="paginatedTasks" :pagination="false" class="events-list">
            <template #renderItem="{ item }">
              <a-list-item class="event-item">
                <a-card class="w-full event-card" :bordered="false"
                  :style="{ borderLeft: `4px solid ${item.color_code || '#1890ff'}` }">
                  <div class="event-content">
                    <!-- Event Header -->
                    <div class="event-header">
                      <div class="event-title">
                        <div class="flex items-center gap-2">
                          <a-tag :color="item.color_code || '#1890ff'" class="m-0">
                            {{ item.tag_name }}
                          </a-tag>
                          <h3 class="text-base font-medium m-0">{{ item.title }}</h3>
                        </div>
                      </div>
                      <div class="event-time">
                        <a-tag :color="getTimeRemainingColor(item.start_time)">
                          {{ formatTimeFromNow(item.start_time) }}
                        </a-tag>
                      </div>
                    </div>

                    <!-- Event Details -->
                    <div class="event-details">
                      <!-- Time Information -->
                      <div class="time-info">
                        <div class="flex items-center gap-2 text-gray-600 text-sm">
                          <ClockCircleOutlined />
                          <span>{{ formatDateTime(item.start_time) }} - {{ formatDateTime(item.end_time) }}</span>
                        </div>
                        <div v-if="item.is_all_day" class="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <CalendarOutlined />
                          <span>{{ language === 'vi' ? 'Cả ngày' : 'All day' }}</span>
                        </div>
                      </div>

                      <!-- Timezone Information -->
                      <div class="timezone-info text-gray-600 text-xs mt-2">
                        <div class="flex items-center gap-2">
                          <GlobalOutlined />
                          <template v-if="item.timezone_code === timeZone || (item.timezone_code === 'Asia/Saigon' && timeZone === 'Asia/Ho_Chi_Minh') || (item.timezone_code === 'Asia/Ho_Chi_Minh' && timeZone === 'Asia/Saigon')">
                            <span>{{ language === 'vi' ? 'Múi giờ:' : 'Timezone:' }} {{ timeZone }}</span>
                          </template>
                          <template v-else>
                            <span>{{ language === 'vi' ? 'Múi giờ sự kiện:' : 'Event timezone:' }} {{ item.timezone_code }}</span>
                            <span class="mx-2">|</span>
                            <span>{{ language === 'vi' ? 'Múi giờ hệ thống:' : 'System timezone:' }} {{ timeZone }}</span>
                          </template>
                        </div>
                      </div>

                      <!-- Location & Links -->
                      <div class="event-links" v-if="item.location || item.link">
                        <div v-if="item.location" class="flex items-center gap-2 text-gray-600 text-sm mt-2">
                          <EnvironmentOutlined />
                          <span>{{ item.location }}</span>
                        </div>
                        <div v-if="item.link" class="flex items-center gap-2 text-gray-600 text-sm mt-2">
                          <VideoCameraOutlined />
                          <a :href="item.link" target="_blank">{{ getMeetingPlatform(item.link) }}</a>
                        </div>
                      </div>

                      <!-- Description -->
                      <div v-if="item.description" class="event-description text-gray-600 text-sm mt-2">
                        <div class="flex items-center gap-2">
                          <FileTextOutlined />
                          <span>{{ item.description }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </div>
        <a-pagination
          v-model:current="currentPage"
          :total="filteredTasks.length"
          :pageSize="pageSize"
          :showSizeChanger="true"
          :showQuickJumper="true"
          :showTotal="(total) => language === 'vi' ? `Tổng ${total} sự kiện` : `Total ${total} events`"
          :pageSizeOptions="['10', '20', '50', '100']"
          @change="(page, size) => {
            currentPage = page;
            pageSize = size;
          }"
          @showSizeChange="(current, size) => {
            pageSize = size;
            currentPage = 1;
          }"
          size="small"
          class="mt-4 text-center"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import moment from 'moment-timezone';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import {
  ClockCircleOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  UserOutlined,
  CrownOutlined,
  BellOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons-vue';
import { useUpcomingTasksStore } from '@/stores/upcomingTasksStore'; // Import store

const settingsStore = useSettingsStore();
const { language, timeZone, timeFormat } = storeToRefs(settingsStore);

const store = useUpcomingTasksStore();

const loading = ref(false);
const error = ref(null);
const upcomingTasks = ref([]);

// Filters
const filters = ref({
  search: '',
  priority: undefined,
  status: undefined
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

// Colors configuration
const eventColors = {
  priority: {
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
    default: '#1890ff'
  },
  type: {
    work: '#1890ff',
    meeting: '#722ed1',
    personal: '#52c41a',
    birthday: '#eb2f96',
    default: '#d9d9d9'
  },
  status: {
    ongoing: '#52c41a',
    upcoming: '#1890ff',
    completed: '#d9d9d9',
    busy: '#ff4d4f',
    free: '#52c41a'
  }
};

const getPriorityLabel = (priority) => {
  const labels = {
    vi: {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp'
    },
    en: {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  };
  return labels[language.value]?.[priority] || priority;
};

const getEventColor = (priority) => {
  return eventColors.priority[priority?.toLowerCase()] || eventColors.priority.default;
};

const getEventTypeColor = (type) => {
  return eventColors.type[type?.toLowerCase()] || eventColors.type.default;
};

const getStatusColor = (status) => {
  return eventColors.status[status?.toLowerCase()] || eventColors.status.default;
};

const formatTimezone = (tz) => {
  const offset = moment.tz(tz).format('Z');
  return `GMT${offset}`;
};

// Format date time
const formatDateTime = (datetime) => {
  if (!datetime) return '';

  const eventTime = moment.utc(datetime).tz(timeZone.value);

  let timeStr;
  if (timeFormat.value === '12h') {
    timeStr = eventTime.format('hh:mm A');
  } else {
    timeStr = eventTime.format('HH:mm');
  }

  const dateStr = eventTime.format('DD/MM/YYYY');
  return `${timeStr} - ${dateStr}`;
};
const isInitialDataLoaded = ref(false);
// Format time from now
const formatTimeFromNow = (datetime) => {
  if (!datetime) return '';

  moment.locale(language.value);
  moment.tz.setDefault(timeZone.value);

  const now = moment();
  const eventTime = moment.utc(datetime).tz(timeZone.value);

  const diffMinutes = eventTime.diff(now, 'minutes');
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isOngoing = diffMinutes <= 0 && diffMinutes > -60;
  const isPast = diffMinutes < 0;

  const formats = {
    vi: {
      ongoing: 'Đang diễn ra',
      past: (unit, value) => `${Math.abs(value)} ${unit} trước`,
      future: (unit, value) => `${value} ${unit} nữa`,
      today: `Hôm nay ${eventTime.format(timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm')}`,
      tomorrow: `Ngày mai ${eventTime.format(timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm')}`,
      default: eventTime.format(`DD/MM/YYYY ${timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm'}`),
    },
    en: {
      ongoing: 'Ongoing',
      past: (unit, value) => `${Math.abs(value)} ${unit} ago`,
      future: (unit, value) => `in ${value} ${unit}`,
      today: `Today at ${eventTime.format(timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm')}`,
      tomorrow: `Tomorrow at ${eventTime.format(timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm')}`,
      default: eventTime.format(`MM/DD/YYYY ${timeFormat.value === '12h' ? 'hh:mm A' : 'HH:mm'}`),
    },
  };

  const t = formats[language.value] || formats.en;

  if (isOngoing) {
    return t.ongoing;
  } else if (isPast) {
    if (diffMinutes > -60) {
      return t.past(language.value === "vi" ? "phút" : "minutes", Math.abs(diffMinutes));
    } else if (diffHours > -24) {
      return t.past(language.value === "vi" ? "giờ" : "hours", Math.abs(diffHours));
    } else if (diffDays > -7) {
      return t.past(language.value === "vi" ? "ngày" : "days", Math.abs(diffDays));
    } else {
      return t.default;
    }
  } else {
    if (diffMinutes < 60) {
      return t.future(language.value === "vi" ? "phút" : "minutes", diffMinutes);
    } else if (diffHours < 24) {
      return t.future(language.value === "vi" ? "giờ" : "hours", diffHours);
    } else if (diffDays < 7) {
      return t.future(language.value === "vi" ? "ngày" : "days", diffDays);
    } else if (eventTime.isSame(now, 'day')) {
      return t.today;
    } else if (eventTime.isSame(now.clone().add(1, 'day'), 'day')) {
      return t.tomorrow;
    } else {
      return t.default;
    }
  }
};

// Get event type label
const getEventTypeLabel = (type) => {
  if (language.value === 'vi') {
    const labels = {
      work: 'Công việc',
      meeting: 'Cuộc họp',
      personal: 'Cá nhân',
      birthday: 'Sinh nhật'
    };
    return labels[type] || type;
  }
  return type;
};

// Get recurrence label
const getRecurrenceLabel = (recurrence) => {
  if (language.value === 'vi') {
    const labels = {
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      monthly: 'Hàng tháng',
      yearly: 'Hàng năm'
    };
    return labels[recurrence] || recurrence;
  }
  return recurrence;
};

// Get meeting platform
const getMeetingPlatform = (url) => {
  if (url.includes('zoom')) return 'Zoom';
  if (url.includes('meet.google')) return 'Google Meet';
  if (url.includes('teams')) return 'Microsoft Teams';
  return language.value === 'vi' ? 'Liên kết họp' : 'Meeting link';
};

// Format reminder
const formatReminder = (reminder) => {
  const time = reminder.set_time;
  let timeText;

  if (time < 60) {
    timeText = language.value === 'vi' ? `${time} phút` : `${time} minutes`;
  } else if (time < 1440) {
    const hours = Math.floor(time / 60);
    timeText = language.value === 'vi' ? `${hours} giờ` : `${hours} hours`;
  } else {
    const days = Math.floor(time / 1440);
    timeText = language.value === 'vi' ? `${days} ngày` : `${days} days`;
  }

  const method = reminder.type === 'email'
    ? (language.value === 'vi' ? 'email' : 'email')
    : (language.value === 'vi' ? 'thông báo' : 'notification');

  return language.value === 'vi'
    ? `${timeText} trước qua ${method}`
    : `${timeText} before via ${method}`;
};

const fetchUpcomingTasks = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}tasks/upComingTasks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response?.data?.code === 200) {
      upcomingTasks.value = (response.data.data || []).map(task => ({
        ...task,
        formattedTime: formatTimeFromNow(task.start_time)
      }));
    } else {
      throw new Error(response?.data?.message || 'Không thể tải danh sách sự kiện');
    }

  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    error.value = err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu';
    message.error(error.value);
    upcomingTasks.value = [];
  } finally {
    loading.value = false;
  }
};

// Computed filtered tasks
const filteredTasks = computed(() => {
  return upcomingTasks.value.filter(task => {
    if (!task) return false;

    const matchSearch = !filters.value.search ||
      task.title?.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchPriority = !filters.value.priority ||
      task.priority === filters.value.priority;

    const matchStatus = !filters.value.status ||
      task.status === filters.value.status;

    return matchSearch && matchPriority && matchStatus;
  });
});

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTasks.value.map(task => ({
    ...task,
    formattedTime: formatTimeFromNow(task.start_time)
  })).slice(start, end);
});

const pagination = computed(() => ({
  total: filteredTasks.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => language.value === 'vi' ? `Tổng ${total} sự kiện` : `Total ${total} events`,
  onChange: (page, size) => {
    currentPage.value = page;
    pageSize.value = size;
  },
  onShowSizeChange: (current, size) => {
    pageSize.value = size;
    currentPage.value = 1;
  },
  pageSizeOptions: ['10', '20', '50', '100']
}));

// Reset filters
const resetFilters = () => {
  filters.value = {
    search: '',
    priority: undefined,
    status: undefined
  };
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

// Watch for settings changes
watch(
  [language, timeZone, timeFormat],
  async ([newLang, newZone, newFormat], [oldLang, oldZone, oldFormat]) => {

    moment.locale(newLang);
    moment.tz.setDefault(newZone);

    await fetchUpcomingTasks();
    if (isInitialDataLoaded.value) {
      await fetchUpcomingTasks();
    }

    // message.success(
    //   language.value === 'vi' 
    //     ? 'Đã cập nhật cài đặt thành công' 
    //     : 'Settings updated successfully'
    // );
  },
  { immediate: true }
);

// Auto-refresh data periodically
let refreshInterval;

onMounted(() => {
  if (store.upcomingTasks.length === 0) {
    store.fetchUpcomingTasks(); // Chỉ gọi API nếu không có dữ liệu
  }
  isInitialDataLoaded.value = true;
  // refreshInterval = setInterval(fetchUpcomingTasks, 5 * 60 * 1000);
});
watch(() => store.upcomingTasks, () => {
  isInitialDataLoaded.value = true;
  upcomingTasks.value = store.upcomingTasks;
}, { immediate: true });

// Handle edit event
const handleEditEvent = (event) => {
  // Xử lý chỉnh sửa sự kiện
};

// Handle view details
const handleViewDetails = (event) => {
  // Xử lý xem chi tiết sự kiện
};

// Add new function to determine color based on time remaining
const getTimeRemainingColor = (startTime) => {
  if (!startTime) return '#1890ff';

  const now = moment();
  const eventTime = moment.utc(startTime).tz(timeZone.value);
  const diffMinutes = eventTime.diff(now, 'minutes');

  if (diffMinutes < 0) return '#d9d9d9'; // Past
  if (diffMinutes < 60) return '#ff4d4f'; // Less than 1 hour
  if (diffMinutes < 1440) return '#faad14'; // Less than 24 hours
  return '#52c41a'; // More than 24 hours
};
</script>

<style scoped>
.upcoming-events-page {
  padding: 0 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 16px;
}

.events-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.events-list {
  flex: 1;
  /* overflow-y: auto;
  max-height: 600px; */
  padding-right: 8px;
}

.events-list::-webkit-scrollbar {
  width: 6px;
}

.events-list::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.events-list::-webkit-scrollbar-track {
  background-color: #f0f0f0;
  border-radius: 3px;
}

.event-item {
  margin-bottom: 8px;
}

.event-card {
  padding: 12px !important;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s;
}

.event-card:hover {
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.event-title {
  flex: 1;
  min-width: 0;
}

.event-title h3 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  flex-shrink: 0;
}

.event-details {
  /* max-height: 320px;       Hoặc tùy ý: 400px, 500px, v.v. */
  overflow-y: auto;
  padding-right: 8px;
  /* Tránh nội dung bị che bởi scrollbar */


  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-description {
  white-space: pre-wrap;
  word-break: break-word;
}

.ant-tag {
  margin-right: 0;
  font-size: 12px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .event-header {
    flex-direction: column;
    gap: 4px;
  }

  .event-time {
    width: 100%;
    text-align: left;
  }
}

:deep(.ant-card-body) {
  padding: 10px !important;
}

:where(.css-dev-only-do-not-override-1aaqe7p).ant-list .ant-list-item {
  padding: 0 !important;
  margin-bottom: 10px;
}

.scrollable-list {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #aaa transparent;
}

.scrollable-list::-webkit-scrollbar {
  width: 6px; /* Độ rộng thanh dọc */
}

.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background-color: #aaa;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
  background-color: #888;
}
</style>
