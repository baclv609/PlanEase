<template>
  <div class="upcoming-events-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          {{ language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events' }}
        </h1>
      </div>

      <!-- Filter Section -->
      <div class="filters flex flex-wrap gap-4 items-center mt-4">
        <a-input-search
          v-model:value="filters.search"
          :placeholder="language === 'vi' ? 'Tìm kiếm sự kiện...' : 'Search events...'"
          @search="handleSearch"
          class="w-64"
        />
        
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

        <a-button type="primary" @click="resetFilters">
          {{ language === 'vi' ? 'Đặt lại' : 'Reset' }}
        </a-button>
      </div>
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
      v-else-if="!filteredTasks.length"
      :description="language === 'vi' ? 'Không có sự kiện sắp tới' : 'No upcoming events'"
      class="my-4"
    />

    <!-- Events list -->
    <template v-else>
      <a-list 
        :data-source="paginatedTasks" 
        :pagination="pagination"
        bordered
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-card 
              class="w-full" 
              :bordered="false"
              :style="{ borderLeft: `4px solid ${item.color || getEventColor(item.priority)}` }"
            >
              <div class="event-card">
                <!-- 1. Thông tin cơ bản -->
                <div class="event-header flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <a-tag :color="getEventColor(item.priority)" class="m-0">
                        {{ getPriorityLabel(item.priority) }}
                      </a-tag>
                      <h3 class="text-lg font-medium m-0">{{ item.title }}</h3>
                      <a-tag :color="getEventTypeColor(item.type)">
                        {{ getEventTypeLabel(item.type) }}
                      </a-tag>
                    </div>
                    
                    <!-- Thời gian và múi giờ -->
                    <div class="text-gray-600 mt-2">
                      <div class="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <span>{{ formatDateTime(item.start_time) }} - {{ formatDateTime(item.end_time) }}</span>
                        <a-tooltip :title="timeZone">
                          <GlobalOutlined />
                          <span class="ml-1">{{ formatTimezone(timeZone) }}</span>
                        </a-tooltip>
                      </div>
                      
                      <!-- Tần suất lặp lại -->
                      <div v-if="item.recurrence" class="flex items-center gap-2 mt-1">
                        <ReloadOutlined />
                        <span>{{ getRecurrenceLabel(item.recurrence) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Trạng thái -->
                  <div class="text-right">
                    <a-tag :color="getStatusColor(item.status)">
                      {{ item.formattedTime }}
                    </a-tag>
                  </div>
                </div>

                <!-- 2. Địa điểm & Liên kết -->
                <div class="event-location-links mb-4">
                  <div v-if="item.location" class="flex items-center gap-2 text-gray-600">
                    <EnvironmentOutlined />
                    <span>{{ item.location }}</span>
                  </div>
                  
                  <div v-if="item.meetingUrl" class="flex items-center gap-2 text-gray-600 mt-1">
                    <VideoCameraOutlined />
                    <a :href="item.meetingUrl" target="_blank">{{ getMeetingPlatform(item.meetingUrl) }}</a>
                  </div>
                  
                  <div v-if="item.relatedUrl" class="flex items-center gap-2 text-gray-600 mt-1">
                    <LinkOutlined />
                    <a :href="item.relatedUrl" target="_blank">{{ language === 'vi' ? 'Tài liệu liên quan' : 'Related documents' }}</a>
                  </div>
                </div>

                <!-- 3. Người tham gia -->
                <div class="event-participants mb-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <UserOutlined />
                      <span class="text-gray-600">{{ item.organizer?.name }}</span>
                      <CrownOutlined v-if="item.isOrganizer" class="text-yellow-500" />
                    </div>
                    
                    <a-avatar-group :max-count="3">
                      <a-tooltip v-for="attendee in item.attendees" :key="attendee.id" :title="attendee.name">
                        <a-avatar :src="attendee.avatar">
                          {{ attendee.name?.[0] }}
                        </a-avatar>
                      </a-tooltip>
                    </a-avatar-group>
                  </div>
                </div>

                <!-- 4. Nhắc nhở -->
                <div v-if="item.reminders?.length" class="event-reminders mb-4">
                  <div class="flex items-center gap-2 text-gray-600">
                    <BellOutlined />
                    <span>
                      {{ formatReminders(item.reminders) }}
                    </span>
                  </div>
                </div>

                <!-- 5. Mô tả & Tài liệu -->
                <div class="event-description">
                  <div v-if="item.description" class="text-gray-600 mb-2">
                    <div class="flex items-center gap-2">
                      <FileTextOutlined />
                      <span>{{ item.description }}</span>
                    </div>
                  </div>
                  
                  <!-- Tài liệu đính kèm -->
                  <div v-if="item.attachments?.length" class="flex flex-wrap gap-2 mt-2">
                    <a-tag 
                      v-for="file in item.attachments" 
                      :key="file.id"
                      class="flex items-center gap-1"
                    >
                      <PaperClipOutlined />
                      {{ file.name }}
                    </a-tag>
                  </div>
                </div>

                <!-- Actions -->
                <div class="event-actions mt-4 flex justify-end gap-2">
                  <a-button 
                    v-if="item.canEdit"
                    type="link" 
                    size="small"
                    @click="handleEditEvent(item)"
                  >
                    <template #icon><EditOutlined /></template>
                    {{ language === 'vi' ? 'Chỉnh sửa' : 'Edit' }}
                  </a-button>
                  
                  <a-button 
                    type="link" 
                    size="small"
                    @click="handleViewDetails(item)"
                  >
                    <template #icon><EyeOutlined /></template>
                    {{ language === 'vi' ? 'Chi tiết' : 'Details' }}
                  </a-button>
                </div>
              </div>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </template>
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
  ReloadOutlined
} from '@ant-design/icons-vue';
import { useUpcomingTasksStore } from '@/stores/upcomingTasksStore'; // Import store

const settingsStore = useSettingsStore();
const { language, timeZone, timeFormat } = storeToRefs(settingsStore);

const store = useUpcomingTasksStore(); // Khởi tạo store

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

// Helper functions for labels
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
  
  const isToday = eventTime.isSame(now, 'day');
  const isTomorrow = eventTime.isSame(now.clone().add(1, 'day'), 'day');
  const isOngoing = diffMinutes <= 0 && diffMinutes > -60;

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

  let result;
  if (isOngoing) {
    result = t.ongoing;
  } else if (diffMinutes < 0) {
    if (diffMinutes > -60) {
      result = t.past(language.value === "vi" ? "phút" : "minutes", Math.abs(diffMinutes));
    } else if (diffHours > -24) {
      result = t.past(language.value === "vi" ? "giờ" : "hours", Math.abs(diffHours));
    } else if (diffDays > -7) {
      result = t.past(language.value === "vi" ? "ngày" : "days", Math.abs(diffDays));
    } else {
      result = t.default;
    }
  } else {
    if (diffMinutes < 60) {
      result = t.future(language.value === "vi" ? "phút" : "minutes", diffMinutes);
    } else if (diffHours < 24) {
      result = t.future(language.value === "vi" ? "giờ" : "hours", diffHours);
    } else if (diffDays < 7) {
      result = t.future(language.value === "vi" ? "ngày" : "days", diffDays);
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

// Format reminders
const formatReminders = (reminders) => {
  if (!reminders?.length) return '';
  
  return reminders.map(reminder => {
    const time = reminder.minutes;
    if (language.value === 'vi') {
      return `${time} phút trước qua ${reminder.method === 'email' ? 'email' : 'thông báo'}`;
    }
    return `${time} minutes before via ${reminder.method}`;
  }).join(', ');
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
      // Process and format the data
      upcomingTasks.value = (response.data.data || []).map(task => ({
        ...task,
        color: task.color || getEventColor(task.priority),
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

// Computed paginated tasks
const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTasks.value.map(task => ({
    ...task,
    formattedTime: formatTimeFromNow(task.start_time)
  })).slice(start, end);
});

// Pagination configuration
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

// Handle search
const handleSearch = () => {
  currentPage.value = 1;
};

// Watch filters
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

// Watch for settings changes
watch(
  [language, timeZone, timeFormat],
  async ([newLang, newZone, newFormat], [oldLang, oldZone, oldFormat]) => {

    // console.log('Settings changed:', {
    //   language: { from: oldLang, to: newLang },
    //   timezone: { from: oldZone, to: newZone },
    //   timeFormat: { from: oldFormat, to: newFormat }
    // });

    // Update moment settings
    moment.locale(newLang);
    moment.tz.setDefault(newZone);

    // Refresh data
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
</script>

<style scoped>
.upcoming-events-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.filters {
  margin-bottom: 24px;
}

.event-card {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s;
}

.event-card:hover {
  background: #fafafa;
}

.ant-card {
  transition: all 0.3s ease;
}

.ant-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ant-tag {
  margin-right: 0;
}

.ant-avatar-group {
  .ant-avatar {
    border: 2px solid #fff;
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .event-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .event-actions {
    justify-content: flex-start;
  }
}
</style>
