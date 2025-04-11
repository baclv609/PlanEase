<template>
  <a-card
    :bodyStyle="{ padding: '16px' }"
    class="!bg-transparent border-none shadow-none"
  >
    <a-dropdown :trigger="['click']">
      <a-button
        class="mb-3 w-50 bg-[#FECA7B] text-black font-bold px-6 py-6 border-none flex items-center justify-center gap-2 rounded-full hover:!text-white transition-colors"
      >
        <PlusOutlined /> {{ t("common.create") }} <CaretDownOutlined />
      </a-button>
      <template #overlay>
        <a-menu class="!bg-[#FECA7B]">
          <a-menu-item
            @click="createEvent"
            class="!text-white transition-colors hover:!bg-[#15C5B2]"
          >
            <CalendarOutlined class="mr-2" /> {{ t("calendar.createEvent") }}
          </a-menu-item>
          <a-menu-item
            @click="createTask"
            class="!text-white transition-colors hover:!bg-[#15C5B2]"
          >
            <CheckSquareOutlined class="mr-2" /> {{ t("calendar.createTask") }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <div class="calendar-section">
      <MiniCalendar
        :events="filteredEvents"
        @dateSelect="handleDateSelect"
        @rangeSelect="handleRangeSelect"
        @viewChange="handleViewChange"
      />
    </div>

    <div class="mt-3">
      <h2 class="mb-0">{{ t("calendar.upcomingEvents") }}</h2>
      <p>{{ t("calendar.dontMissEvents") }}</p>

      <!-- Loading state -->
      <!-- <div v-if="loading" class="flex justify-center my-4">
        <a-spin />
      </div> -->

      <!-- Error state -->
      <a-empty v-if="error" :description="error" class="my-4">
        <template #extra>
          <a-button type="primary" @click="fetchUpcomingTasks">
            {{ t("common.retry") }}
          </a-button>
        </template>
      </a-empty>

      <!-- No events -->
      <a-empty
        v-else-if="!formattedUpcomingTasks.length"
        :description="t('calendar.noUpcomingEvents')"
        class="my-4"
      />

      <!-- Events list -->
      <template v-if="formattedUpcomingTasks.length">
        <a-list :data-source="displayedUpcomingTasks" bordered>
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

        <!-- Nút xem thêm -->
        <div v-if="hasMoreTasks" class="text-center mt-3">
          <a-button type="link" @click="viewMoreEvents">
            {{ t("common.viewMore") }}
          </a-button>
        </div>
      </template>
    </div>

    <div class="mt-5 bg-[#FEF9EF] rounded-lg p-3">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">{{ $t("calendar.calendarSection.title") }}</h3>
        <PlusOutlined
          @click="isModalOpenAddTag = true"
          class="flex items-center justify-center text-black-500 text-[16px] cursor-pointer bg-[#FFCB77] rounded-full p-[2px]"
        />
      </div>

      <a-checkbox-group
        v-model:value="selectedCalendars"
        class="flex flex-col gap-2"
        @change="updateFilteredEvents"
      >
        <div v-if="myCalendars.length">
          <div
            v-for="calendar in displayedCalendars"
            :key="calendar.id"
            class="flex bg-[#FDE4B2] justify-between p-1 mb-1 rounded-lg shadow-sm hover:shadow-md items-center transition-all"
          >
            <div class="flex items-center">
              <a-checkbox :value="calendar.id" :checked="true" class="" :style="{ '--ant-checkbox-color': calendar.color_code }">
                <span class="text-gray-700 text-sm font-medium">{{ calendar.name }}</span>
              </a-checkbox>
            </div>

            <a-dropdown :trigger="['click']">
              <EllipsisOutlined
                class="text-gray-500 text-lg cursor-pointer hover:text-black transition"
              />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="displayOnly(calendar.id)">Hiển thị duy nhất</a-menu-item>
                  <a-menu-item @click="openUpdateCalendar(calendar.id)">{{
                    $t("calendar.calendarSection.edit")
                  }}</a-menu-item>
                  <a-menu-item @click="deleteCalendar(calendar.id)" style="color: red">{{
                    $t("calendar.calendarSection.delete")
                  }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        
      </a-checkbox-group>
    </div>
  </a-card>

  <AddTagModal
    v-model:open="isModalOpenAddTag"
    @tagAdded="handleTagAdded"
  />

  <UpdateTagModal
    v-model:open="isModalOpenUpdateTag"
    :tag="selectedTagCalendar"
    @tagUpdated="handleTagUpdated"
  />

  <EventModal
    :open="isAddEventModalVisible"
    :event="selectedEventAdd"
    @save="handleEventModalSuccess"
    @cancel="isAddEventModalVisible = false"
  />
  <TagDetailModal
    :open="isTagDetailModalVisible"
    :selectedCalendarId="selectedCalendarId"
    @update:open="isTagDetailModalVisible = false"
  />
</template>

<script setup>
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EllipsisOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  CloseOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

import dayjs from "dayjs";
import { ref, onMounted, onBeforeUnmount, computed, onUnmounted, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useEchoStore } from "@/stores/echoStore";
import debounce from "lodash/debounce";
import MiniCalendar from "@/components/calendar/MiniCalendar.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import EventModal from "@/views/calendar/components/EventModal.vue";
import moment from "moment-timezone";
import { useI18n } from "vue-i18n";
import { useUpcomingTasksStore } from "@/stores/upcomingTasksStore";
import { useHiddenTagsStore } from "@/stores/hiddenTagsStore";
import TagDetailModal from "../modal/TagDetailModal.vue";
import AddTagModal from "@/components/modal/AddTagModal.vue";
import UpdateTagModal from "@/components/modal/UpdateTagModal.vue";

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");

const { t } = useI18n();

const hiddenTagsStore = useHiddenTagsStore(); // Khởi tạo store

const isModalOpenAddTag = ref(false);
const isModalOpenUpdateTag = ref(false);

const colorOptions = [
  { value: '#FF5733', label: 'Red' },
  { value: '#33FF57', label: 'Green' },
  { value: '#3357FF', label: 'Blue' },
  { value: '#F1C40F', label: 'Yellow' },
  { value: '#8E44AD', label: 'Purple' },
  { value: '#E74C3C', label: 'Coral' },
  { value: '#3498DB', label: 'Sky Blue' },
  { value: '#2ECC71', label: 'Emerald' },
  { value: '#9B59B6', label: 'Amethyst' },
  { value: '#1ABC9C', label: 'Turquoise' },
  { value: '#E67E22', label: 'Orange' },
  { value: '#34495E', label: 'Dark Blue' }
];

const newTagCalendar = ref({
  name: "",
  color_code: "#FF5733",
  description: "",
  attendees: [],
  attendeeRole: "viewer",
});
const selectedTagCalendar = ref({
  name: "",
  color_code: "#FF5733",
  description: "",
  shared_user: [],
  attendees: [],
  attendeeRole: "viewer",
});

const selectedDate = ref(dayjs());
const selectedCalendars = ref([]);
const router = useRouter();

const myCalendars = ref([]);
const sharedCalendars = ref([]);
const filteredEvents = ref([]);
const events = ref([]);

const showAll = ref(false);
const showAllShared = ref(false);

const isAddEventModalVisible = ref(false);
const selectedEventAdd = ref(null);

const store = useUpcomingTasksStore();
const settingsStore = useSettingsStore();

const loading = computed(() => store.loading);
const error = computed(() => store.error);
const upcomingTasks = computed(() => store.upcomingTasks);

const isTagDetailModalVisible = ref(false);
const selectedTag = ref(null);

const selectedCalendarId = ref(null);

// Lấy thông tin khách mời
const state = ref({
  data: [],
  fetching: false,
});

let lastFetchId = 0;

const fetchUser = debounce(async (value) => {
  if (!value) {
    state.value.data = [];
    return;
  }

  lastFetchId += 1;
  const fetchId = lastFetchId;

  state.value.fetching = true;

  try {
    const response = await axios.get(`${dirApi}guest?search=${value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (fetchId !== lastFetchId) return;

    state.value.data = response.data.data.map((user) => ({
      label: `${user.email}`,
      value: user.id,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    state.value.data = [];
  } finally {
    state.value.fetching = false;
  }
}, 300);

// Khởi tạo echo store
const echoStore = useEchoStore();

const isInitialDataLoaded = ref(false);
let refreshInterval;

// Thêm biến để theo dõi các giá trị trước đó
const previousValues = ref({
  language: settingsStore.language,
  timeZone: settingsStore.timeZone,
  timeFormat: settingsStore.timeFormat,
});

// const calendarTagsStore = useCalendarTagsStore();

// 1.
const fetchUpcomingTasks = async () => {
  await store.fetchUpcomingTasks();
};

watch(
  () => ({
    language: settingsStore.language,
    timeZone: settingsStore.timeZone,
    timeFormat: settingsStore.timeFormat,
  }),
  (newValues) => {
    if (newValues.language) {
      moment.locale(newValues.language);
    }
    if (newValues.timeZone) {
      moment.tz.setDefault(newValues.timeZone);
    }

    // Chỉ fetch lại dữ liệu nếu có sự thay đổi và đã load dữ liệu ban đầu
    if (
      isInitialDataLoaded.value &&
      (newValues.language !== previousValues.value.language ||
        newValues.timeZone !== previousValues.value.timeZone ||
        newValues.timeFormat !== previousValues.value.timeFormat)
    ) {
      fetchUpcomingTasks();
    }

    previousValues.value = { ...newValues };
  },
  { immediate: true, deep: true }
);

// 3. Định nghĩa computed property
const formattedUpcomingTasks = computed(() => {
  return upcomingTasks.value.map((task) => ({
    ...task,
    formattedTime: formatTimeFromNow(task.start_time),
  }));
});

// 4. Thêm interval refresh trong onMounted
onMounted(() => {
  store.fetchUpcomingTasks();
  isInitialDataLoaded.value = true;

  // Refresh mỗi phút
  refreshInterval = setInterval(() => {
    store.fetchUpcomingTasks();
  }, 60000);
});

// 5.
// onUnmounted(() => {
//   if (refreshInterval) {
//     clearInterval(refreshInterval);
//   }
// });

const handleDateSelect = ({ date, events }) => {
  if (!date) return;

  const year = date.format("YYYY");
  const month = date.format("M");
  const day = date.format("D");

  // Update settings store with the selected date
  settingsStore.initialDate = date.format("YYYY-MM-DD");

  // Navigate to the day view
  router.push({
    name: "calendar-view",
    params: {
      view: "day",
      year,
      month,
      day,
    },
  });
};

const handleRangeSelect = ({ start, end, events }) => {
  if (!start || !end) return;

  // Calculate number of days between start and end
  const daysDiff = end.diff(start, "day") + 1;

  const year = start.format("YYYY");
  const month = start.format("M");
  const day = start.format("D");

  settingsStore.initialDate = start.format("YYYY-MM-DD");

  // Navigate to the custom range view
  router.push({
    name: "calendar-custom",
    params: {
      days: daysDiff,
      year,
      month,
      day,
    },
  });
};

const handleViewChange = ({ mode, date, start, end, events }) => {
  if (date) {
    settingsStore.initialDate = date.format("YYYY-MM-DD");
  } else if (start) {
    settingsStore.initialDate = start.format("YYYY-MM-DD");
  }
};

const updateFilteredEvents = () => {
  // Lưu danh sách các tag bị bỏ tích
  const unselectedTags = [...myCalendars.value, ...sharedCalendars.value]
    .filter((cal) => !selectedCalendars.value.includes(cal.id))
    .map((cal) => cal.id);

  hiddenTagsStore.setHiddenTags(unselectedTags);
  // console.log("Các tag bị bỏ tích:", unselectedTags);
};

watch(
  [myCalendars, sharedCalendars],
  ([newMyCalendars, newSharedCalendars]) => {
    // Khi có dữ liệu mới, cập nhật selectedCalendars
    const allCalendarIds = [...newMyCalendars, ...newSharedCalendars].map(
      (cal) => cal.id
    );
    selectedCalendars.value = allCalendarIds;
    updateFilteredEvents();
  },
  { immediate: true }
);

onMounted(() => {
  const allCalendarIds = [...myCalendars.value, ...sharedCalendars.value].map(
    (cal) => cal.id
  );
  selectedCalendars.value = allCalendarIds;
  updateFilteredEvents();
});
const displayOnly = (calendarId) => {
  // Chỉ giữ lại tag được chọn
  selectedCalendars.value = [calendarId];
  
  // Cập nhật danh sách tag bị ẩn
  const allCalendarIds = [...myCalendars.value, ...sharedCalendars.value]
    .filter(cal => cal.id !== calendarId)
    .map(cal => cal.id);
  
  hiddenTagsStore.setHiddenTags(allCalendarIds);
  
  // Hiển thị thông báo
  const selectedTag = [...myCalendars.value, ...sharedCalendars.value].find(cal => cal.id === calendarId);
  if (selectedTag) {
    message.success(t('success.displayOnly', { name: selectedTag.name }));
  }
};

const openDrawerAdd = () => {
  isModalOpenAddTag.value = true;
};

// Thay đổi computed property displayedCalendars để luôn hiển thị tất cả
const displayedCalendars = computed(() => {
  return myCalendars.value;
});

const displayedSharedCalendars = computed(() => {
  return sharedCalendars.value;
});

const fetchCalendars = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const myTagsResponse = axios.get(`${dirApi}tags`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const sharedTagsResponse = axios.get(`${dirApi}tags/sharedTags`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const [myTags, sharedTags] = await Promise.all([myTagsResponse, sharedTagsResponse]);

    if (myTags.data.code === 200) {
      myCalendars.value = myTags.data.data;
    } else {
      message.error("Không thể lấy danh sách tags của bạn");
    }

    if (sharedTags.data.code === 200) {
      sharedCalendars.value = sharedTags.data.data;
    } else {
      message.error("Không thể lấy danh sách tags được chia sẻ");
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tags:", error);
    message.error("Lỗi kết nối đến server");
  }
};

fetchCalendars();

const handleTagAdded = (newTag) => {
  myCalendars.value.push(newTag);
  // Thêm tag mới vào selectedCalendars để tự động tích checkbox
  selectedCalendars.value.push(newTag.id);
  updateFilteredEvents();
};

const handleTagUpdated = (updatedTag) => {
      myCalendars.value = myCalendars.value.map((tag) =>
    tag.id === updatedTag.id ? updatedTag : tag
  );
  updateFilteredEvents();
};

const handleEventModalSuccess = () => {
  isAddEventModalVisible.value = false;
  selectedEventAdd.value = null;
};

const formatDateTime = (datetime) => {
  const { timeFormat, timeZone } = settingsStore;

  // Đảm bảo moment sử dụng đúng múi giờ
  moment.tz.setDefault(timeZone);

  // Chuyển đổi datetime từ UTC sang múi giờ local
  const eventTime = moment.utc(datetime).tz(timeZone);

  let timeStr;
  if (timeFormat === "12h") {
    // Định dạng 12h với AM/PM
    timeStr = eventTime.format("hh:mm A");
  } else {
    // Định dạng 24h
    timeStr = eventTime.format("HH:mm");
  }

  const dateStr = eventTime.format("DD/MM/YYYY");

  return `${timeStr} - ${dateStr}`;
};

// Format time from now
const formatTimeFromNow = (datetime) => {
  const { language, timeZone, timeFormat } = settingsStore;

  // console.log("Input datetime (UTC):", datetime);
  // console.log("Current settings:", { language, timeZone, timeFormat });

  moment.locale(language);
  moment.tz.setDefault(timeZone);

  // Chuyển đổi datetime từ UTC sang múi giờ local
  const now = moment();
  const eventTime = moment.utc(datetime).tz(timeZone);

  // console.log("Now in local timezone:", now.format());
  // console.log("Event time in local timezone:", eventTime.format());

  // Tính toán khoảng cách thời gian
  const diffMinutes = eventTime.diff(now, "minutes");
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Kiểm tra các trường hợp đặc biệt
  const isToday = eventTime.isSame(now, "day");
  const isTomorrow = eventTime.isSame(now.clone().add(1, "day"), "day");
  const isOngoing = diffMinutes <= 0 && diffMinutes > -60;

  const formatTime = (time) => {
    if (timeFormat === "12h") {
      return time.format("hh:mm A"); // 12h format với AM/PM
    }
    return time.format("HH:mm"); // 24h format
  };

  const formats = {
    vi: {
      ongoing: "Đang diễn ra",
      past: (unit, value) => `${Math.abs(value)} ${unit} trước`,
      future: (unit, value) => `${value} ${unit} nữa`,
      today: `Hôm nay ${formatTime(eventTime)}`,
      tomorrow: `Ngày mai ${formatTime(eventTime)}`,
      default: eventTime.format("DD/MM/YYYY ") + formatTime(eventTime),
    },
    en: {
      ongoing: "Ongoing",
      past: (unit, value) => `${Math.abs(value)} ${unit} ago`,
      future: (unit, value) => `in ${value} ${unit}`,
      today: `Today at ${formatTime(eventTime)}`,
      tomorrow: `Tomorrow at ${formatTime(eventTime)}`,
      default: eventTime.format("MM/DD/YYYY ") + formatTime(eventTime),
    },
  };

  const t = formats[language] || formats.en;

  let result;
  if (isOngoing) {
    result = t.ongoing;
  } else if (diffMinutes < 0) {
    // Sự kiện đã qua
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
    // Sự kiện sắp tới
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

// Get color based on priority
const getEventColor = (priority) => {
  const colors = {
    high: "red",
    medium: "orange",
    low: "blue",
    default: "gray",
  };
  return colors[priority?.toLowerCase()] || colors.default;
};

// 1. Thêm computed property để giới hạn số lượng sự kiện
const displayedUpcomingTasks = computed(() => {
  return formattedUpcomingTasks.value.slice(0, 3);
});

// 2. Thêm computed property để kiểm tra có sự kiện còn lại không
const hasMoreTasks = computed(() => {
  return formattedUpcomingTasks.value.length > 3;
});

const viewMoreEvents = () => {
  router.push({ name: "upcoming" });
};

// Thêm hàm xử lý khi checkbox thay đổi
const handleCheckboxChange = (checked, calendarId) => {
  if (checked) {
    // Nếu tag đang bị ẩn và được tích, hiển thị tất cả tags
    const isHidden =
      !displayedCalendars.value.some((cal) => cal.id === calendarId) ||
      !displayedSharedCalendars.value.some((cal) => cal.id === calendarId);

    if (isHidden) {
      if (myCalendars.value.some((cal) => cal.id === calendarId)) {
        showAll.value = true;
      } else if (sharedCalendars.value.some((cal) => cal.id === calendarId)) {
        showAllShared.value = true;
      }
    }
    // Xóa tag khỏi danh sách ẩn
    // calendarTagsStore.removeHiddenTagId(calendarId);
  }
};

const viewDetails = (calendarId) => {
  console.log("Xem chi tiết cho calendar ID:", calendarId);
  isTagDetailModalVisible.value = true;

  selectedCalendarId.value = calendarId;

};

const deleteCalendar = async (calendarId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(`${dirApi}tags/${calendarId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Xóa tag", response.data);

    if (response.data.code === 200) {
      myCalendars.value = myCalendars.value.filter(
        (calendar) => calendar.id !== calendarId
      );
      sharedCalendars.value = sharedCalendars.value.filter(
        (calendar) => calendar.id !== calendarId
      );

      message.success(t("success.tagDeleted"));
    } else {
      message.error(response.data.message || "Có lỗi xảy ra!");
    }
  } catch (error) {
    console.error("Lỗi khi xóa tag:", error);
    message.error("Không thể xóa tag. Vui lòng thử lại.");
  }
};

// Update
const openUpdateCalendar = (calendarId) => {
  const calendar = myCalendars.value.find((cal) => cal.id === calendarId);
  if (calendar) {
    // Chuyển đổi shared_user thành định dạng attendees
    const attendees =
      calendar.shared_user?.map((user) => ({
        label: user.email || user.user?.email || "",
        value: user.user_id || user.id || user.user?.id || "",
      })) || [];

    selectedTagCalendar.value = {
      id: calendar.id,
      name: calendar.name,
      color_code: calendar.color_code,
      description: calendar.description,
      shared_user: calendar.shared_user ?? [],
      attendees: attendees,
      attendeeRole: "viewer",
    };
    isModalOpenUpdateTag.value = true;
  }
};

onBeforeUnmount(() => {
  echoStore.stopListening();
});
</script>

<style scoped>
.event-details {
  overflow: hidden;
}

.event-details div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: var(--ant-checkbox-color) !important;
  border-color: var(--ant-checkbox-color) !important;
}

:deep(.ant-checkbox-wrapper:hover .ant-checkbox-inner),
:deep(.ant-checkbox:hover .ant-checkbox-inner) {
  border-color: var(--ant-checkbox-color) !important;
}

:deep(.ant-checkbox-wrapper:hover .ant-checkbox-checked .ant-checkbox-inner),
:deep(.ant-checkbox:hover .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: var(--ant-checkbox-color) !important;
  border-color: var(--ant-checkbox-color) !important;
}

:deep(.ant-checkbox-checked::after) {
  border-color: var(--ant-checkbox-color) !important;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
}

.color-selected {
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
}

.check-icon {
  color: white;
  font-size: 16px;
  filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.3));
}

:deep(.ant-select-selector) {
  height: 40px !important;
  padding: 4px 11px !important;
  display: flex;
  align-items: center;
}

:deep(.ant-select-selection-item) {
  display: flex;
  align-items: center;
}

:deep(.ant-select-selection-item span) {
  width: 24px;
  height: 24px;
}
</style>
