<template>
  <a-card :bodyStyle="{ padding: '16px' }" class="!bg-transparent border-none shadow-none">
    <a-dropdown :trigger="['click']">
      <a-button class="mb-3 w-50 bg-[#FECA7B] text-black font-bold px-6 py-6 border-none flex items-center justify-center gap-2 rounded-full hover:!text-white transition-colors">
        <PlusOutlined /> Tạo mới <CaretDownOutlined />
      </a-button>
      <template #overlay>
        <a-menu class="!bg-[#FECA7B]">
          <a-menu-item @click="createEvent" class="!text-white transition-colors hover:!bg-[#15C5B2]">
            <CalendarOutlined class="mr-2" /> Tạo sự kiện
          </a-menu-item>
          <a-menu-item @click="createTask" class="!text-white transition-colors hover:!bg-[#15C5B2]">
            <CheckSquareOutlined class="mr-2" /> Tạo việc cần làm
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
      <h2 class="mb-0">Sự kiện sắp tới</h2>
      <p>Đừng bỏ lỡ các sự kiện đã lên lịch</p>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center my-4">
        <a-spin />
      </div>

      <!-- Error state -->
      <a-empty
        v-else-if="error"
        :description="error"
        class="my-4"
      >
        <template #extra>
          <a-button type="primary" @click="fetchUpcomingTasks">
            Thử lại
          </a-button>
        </template>
      </a-empty>

      <!-- No events -->
      <a-empty
        v-else-if="!upcomingTasks.length"
        description="Không có sự kiện nào trong 24h tới"
        class="my-4"
      />

      <!-- Events list -->
      <a-list v-else :data-source="upcomingTasks" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="flex justify-between w-full items-center">
              <a-badge :color="getEventColor(item.priority)" />
              <div class="event-details flex-1 mx-3">
                <div class="font-medium">{{ item.title }}</div>
                <div class="text-sm text-gray-500">
                  {{ formatDateTime(item.start_time) }}
                </div>
              </div>
              <a-tag :color="getEventColor(item.priority)">
                {{ formatTimeFromNow(item.start_time) }}
              </a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div class="mt-5 bg-[#FEF9EF] rounded-lg p-3">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">Lịch của tôi</h3>
        <PlusOutlined @click="isModalOpenAddTag = true" class="flex items-center justify-center text-black-500 text-[16px] cursor-pointer bg-[#FFCB77] rounded-full p-[2px]" />
      </div>

      <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2" @change="updateFilteredEvents">
        <!-- Lịch của tôi -->
        <div v-if="myCalendars.length">
          <h4 class="text-gray-500 text-sm font-semibold mb-2">📌 Lịch của tôi</h4>

          <div v-for="(calendar, index) in displayedCalendars" :key="calendar.id"
            class="flex bg-[#FDE4B2] justify-between p-1 mb-1 rounded-lg shadow-sm hover:shadow-md items-center transition-all"
            :style="{ borderLeft: `4px solid ${calendar.color}` }">

            <div class="flex items-center">
              <span
                :style="{ backgroundColor: calendar.color, width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px' }"></span>
              <!-- Hình tròn nhỏ -->
              <a-checkbox :value="calendar.id" class="">
                <span class="text-gray-700 text-sm font-medium">{{ calendar.name }}</span>
              </a-checkbox>
            </div>

            <a-dropdown>
              <EllipsisOutlined class="text-gray-500 text-lg cursor-pointer hover:text-black transition" />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="displayOnly(calendar.id)">Hiển thị duy nhất</a-menu-item>
                  <a-menu-item @click="viewDetails(calendar.id)">Chi tiết</a-menu-item>
                  <a-menu-item @click="openUpdateCalendar(calendar.id)">Chỉnh sửa</a-menu-item>
                  <a-menu-item @click="deleteCalendar(calendar.id)" style="color: red;">Xóa</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-if="myCalendars.length > 5" class="flex justify-center mt-2">
            <a-button type="text" @click="showAll = !showAll">
              <template v-if="showAll">
                <CaretUpOutlined />
              </template>
              <template v-else>
                <CaretDownOutlined />
              </template>
            </a-button>
          </div>
        </div>

        <!-- Lịch được chia sẻ -->
        <div v-if="sharedCalendars.length" class="mt-4">
          <h4 class="text-gray-500 text-sm font-semibold mb-2">🔗 Lịch được chia sẻ</h4>
          <div v-for="(calendar, index) in displayedSharedCalendars" :key="calendar.id"
            class="flex bg-white border border-gray-200 justify-between p-2 rounded-lg shadow-sm hover:shadow-md items-center transition-all"
            :style="{ borderLeft: `5px solid ${calendar.color}` }">

            <div class="flex items-center">
              <span
                :style="{ backgroundColor: calendar.color, width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px' }"></span>
              <a-checkbox :value="calendar.id" class="ml-2">
                <span class="text-gray-700 text-sm font-medium">{{ calendar.name }}</span>
              </a-checkbox>
            </div>

            <a-dropdown>
              <EllipsisOutlined class="text-gray-500 text-lg cursor-pointer hover:text-black transition" />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="displayOnly(calendar.id)">Hiển thị duy nhất</a-menu-item>
                  <a-menu-item @click="viewDetails(calendar.id)">Chi tiết</a-menu-item>
                  <a-menu-item @click="openUpdateCalendar(calendar.id)">Chỉnh sửa</a-menu-item> <a-menu-item
                    @click="deleteCalendar(calendar.id)" style="color: red;">Xóa</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-if="sharedCalendars.length > 5" class="flex justify-center mt-2">
            <a-button type="text" @click="showAllShared = !showAllShared">
              <template v-if="showAllShared">
                <CaretUpOutlined />
              </template>
              <template v-else>
                <CaretDownOutlined />
              </template>
            </a-button>
          </div>

        </div>
      </a-checkbox-group>
    </div>

  </a-card>

  <a-modal v-model:open="isModalOpenAddTag" title="Thêm tag" @ok="handleOk">
    <a-form layout="vertical">
      <a-form-item label="Tên tag" required>
        <a-input v-model:value="newTagCalendar.name" placeholder="Nhập tên tag" />
      </a-form-item>
      <a-form-item label="Màu sắc (Hex Code)">
        <input type="color" v-model="newTagCalendar.color" class="border h-10 rounded w-10 cursor-pointer" />
      </a-form-item>
      <a-form-item label="Mô tả">
        <a-textarea v-model:value="newTagCalendar.description" placeholder="Nhập mô tả tag" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal v-model:open="isModalOpenUpdateTag" title="Cập nhật Tag" @ok="handleUpdateOk">
    <a-form layout="vertical">
      <a-form-item label="Tên tag" required>
        <a-input v-model:value="selectedTagCalendar.name" placeholder="Nhập tên tag" />
      </a-form-item>
      <a-form-item label="Màu sắc (Hex Code)">
        <input type="color" v-model="selectedTagCalendar.color" class="border h-10 rounded w-10 cursor-pointer" />
      </a-form-item>
      <a-form-item label="Mô tả">
        <a-textarea v-model:value="selectedTagCalendar.description" placeholder="Nhập mô tả tag" :rows="3" />
      </a-form-item>

      <a-form-item label="Người được mời">
        <a-select v-model:value="selectedTagCalendar.attendees" mode="multiple" label-in-value placeholder="Khách mời"
          style="width: 100%" :filter-option="false" :not-found-content="state.fetching ? undefined : null"
          :options="state.data" @search="fetchUser" />
      </a-form-item>

    </a-form>
  </a-modal>

  <EventModal 
    :open="isAddEventModalVisible" 
    :event="selectedEventAdd" 
    @save="handleEventModalSuccess"
    @cancel="isAddEventModalVisible = false" 
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
} from "@ant-design/icons-vue";

import dayjs from "dayjs";
import { ref, onMounted, onBeforeUnmount, computed, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useEchoStore } from "@/stores/echoStore";
import debounce from 'lodash/debounce';
import MiniCalendar from '@/components/calendar/MiniCalendar.vue';
import { useSettingsStore } from "@/stores/settingsStore";
import EventModal from "@/views/calendar/components/EventModal.vue";
import moment from 'moment';


const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const isModalOpenAddTag = ref(false);
const isModalOpenUpdateTag = ref(false);

const newTagCalendar = ref({ name: "", color: "#1890ff", description: "" });
const selectedTagCalendar = ref({ name: "", color: "#1890ff", description: "", shared_user: "" });

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

const upcomingTasks = ref([]);
const loading = ref(false);
const error = ref(null);


// Lấy thông tin khách mời
const state = ref({
  data: [],
  fetching: false
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
      }
    });

    if (fetchId !== lastFetchId) return;

    state.value.data = response.data.data.map(user => ({
      label: `${user.email}`,
      value: user.id
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    state.value.data = [];
  } finally {
    state.value.fetching = false;
  }
}, 300);
// Kết thúc hàm lấy thông tin khách mời

// Khởi tạo echo store
const echoStore = useEchoStore();

const settingsStore = useSettingsStore();

const handleDateSelect = ({ date, events }) => {
  if (!date) return;
  
  const year = date.format("YYYY");
  const month = date.format("MM");
  const day = date.format("DD");

  // Update settings store with the selected date
  settingsStore.initialDate = date.format('YYYY-MM-DD');
  
  // Navigate to the day view
  router.push({
    name: 'calendar-day',
    params: { year, month, day }
  });
};

const handleRangeSelect = ({ start, end, events }) => {
  if (!start || !end) return;
  
  // Update settings store with the start date
  settingsStore.initialDate = start.format('YYYY-MM-DD');
  
  // Navigate to the range view
  router.push({
    name: 'calendar-range',
    params: {
      range: `${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`
    }
  });
};

const handleViewChange = ({ mode, date, start, end, events }) => {
  if (date) {
    settingsStore.initialDate = date.format('YYYY-MM-DD');
  } else if (start) {
    settingsStore.initialDate = start.format('YYYY-MM-DD');
  }
};

const updateFilteredEvents = () => {
  filteredEvents.value = events.value.filter((event) =>
    selectedCalendars.value.includes(event.calendarId)
  );
};

const displayOnly = (calendarId) => {
  selectedCalendars.value = [calendarId];
};

const openDrawerAdd = () => {
  isModalOpenAddTag.value = true;
};

// Giới hạn hiển thị
const displayedCalendars = computed(() => {
  return showAll.value ? myCalendars.value : myCalendars.value.slice(0, 5);
});

const displayedSharedCalendars = computed(() => {
  return showAllShared.value ? sharedCalendars.value : sharedCalendars.value.slice(0, 5);
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


const handleOk = async () => {
  if (!newTagCalendar.value.name) {
    message.error("Vui lòng nhập tên tag!");
    return;
  }

  const randomColors = [
    "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#8E44AD",
    "#E74C3C", "#3498DB", "#2ECC71", "#9B59B6", "#1ABC9C",
  ];

  if (!newTagCalendar.value.color) {
    newTagCalendar.value.color = randomColors[Math.floor(Math.random() * randomColors.length)];
  }

  try {
    const response = await axios.post(`${dirApi}tags`,
      {
        name: newTagCalendar.value.name,
        description: newTagCalendar.value.description,
        color_code: newTagCalendar.value.color,
        shared_user: [],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201) {
      myCalendars.value.push(response.data.data);
      console.log("Tag đã được tạo:", response.data.data);
      updateFilteredEvents();
      message.success(`Đã thêm tag: ${newTagCalendar.value.name}`);
      isModalOpenAddTag.value = false;

      newTagCalendar.value = { name: "", color: "#1890ff", description: "" };
    }
  } catch (error) {
    console.error("Lỗi khi thêm tag:", error); // Log lỗi chi tiết
    if (error.response) {
      if (error.response.status === 409) {
        message.error("Tag này đã tồn tại!");
      } else {
        message.error(`Lỗi khi thêm tag: ${error.response.data.message}`);
      }
    } else {
      message.error("Không thể kết nối đến máy chủ!");
    }
  }
};


onBeforeUnmount(() => {
  echoStore.stopListening();
});


const viewDetails = (calendarId) => {
  // console.log("Xem chi tiết cho calendar ID:", calendarId);
};

const deleteCalendar = async (calendarId) => {

  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(`${dirApi}tags/${calendarId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Xóa tag", response.data);

    if (response.data.code === 200) {
      myCalendars.value = myCalendars.value.filter(calendar => calendar.id !== calendarId);
      sharedCalendars.value = sharedCalendars.value.filter(calendar => calendar.id !== calendarId);

      message.success("Tag deleted successfully!");

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
  const calendar = myCalendars.value.find(cal => cal.id === calendarId);
  if (calendar) {
    selectedTagCalendar.value = {
      id: calendar.id,
      name: calendar.name,
      color: calendar.color_code,
      description: calendar.description,
      shared_user: calendar.shared_user ?? []
    };
    isModalOpenUpdateTag.value = true;
  }
};

const handleUpdateOk = async () => {
  try {
    const oldTag = myCalendars.value.find(tag => tag.id === selectedTagCalendar.value.id);

    if (!selectedTagCalendar.value.color && oldTag) {
      selectedTagCalendar.value.color = oldTag.color_code; // Đổi lại để đồng nhất key
    }

    const response = await axios.put(
      `${dirApi}tags/${selectedTagCalendar.value.id}`,
      { ...selectedTagCalendar.value, color_code: selectedTagCalendar.value.color }, // Chuyển 'color' thành 'color_code'
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✅ Phản hồi từ server:", response.data);

    if (response.data.success) {
      message.success("Cập nhật tag thành công!");
      isModalOpenUpdateTag.value = false;

      // Dùng dữ liệu từ API để cập nhật danh sách, tránh lệch dữ liệu
      myCalendars.value = myCalendars.value.map(tag =>
        tag.id === response.data.data.id
          ? response.data.data // Cập nhật theo API response
          : tag
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật tag:", error);
    message.error("Lỗi khi cập nhật tag!");
  }
};


// Lắng nghe sự kiện real-time
onMounted(() => {
  echoStore.initEcho();
  echoStore.startListening();
  fetchUpcomingTasks();
});

const createEvent = () => {
  selectedEventAdd.value = {
    type: 'event',
    start: dayjs().format('YYYY-MM-DD HH:mm'),
    end: dayjs().add(30, 'minutes').format('YYYY-MM-DD HH:mm'),
    allDay: false,
  };
  isAddEventModalVisible.value = true;
};

const createTask = () => {
  selectedEventAdd.value = { 
    type: 'task' 
  };
  isAddEventModalVisible.value = true;
};

const handleEventModalSuccess = () => {
  isAddEventModalVisible.value = false;
  selectedEventAdd.value = null;
};

const fetchUpcomingTasks = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${dirApi}tasks/upComingTasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if response exists and has data
    if (response?.data?.code === 200) {
      // If data exists but is empty array, set empty array
      upcomingTasks.value = response.data.data || [];
    } else {
      // If response code is not 200, throw error with message
      throw new Error(response?.data?.message || 'Không thể tải danh sách sự kiện');
    }

  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    
    // Handle different types of errors
    if (err.response) {
      // Server responded with error status
      if (err.response.status === 500) {
        error.value = 'Lỗi máy chủ, vui lòng thử lại sau';
      } else if (err.response.status === 401) {
        error.value = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
      } else {
        error.value = err.response.data?.message || 'Không thể tải danh sách sự kiện';
      }
    } else if (err.request) {
      // Request made but no response received
      error.value = 'Không thể kết nối đến máy chủ';
    } else {
      // Other errors
      error.value = 'Đã xảy ra lỗi, vui lòng thử lại';
    }

    // Clear tasks on error
    upcomingTasks.value = [];
    
    // Show error message
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Format date time
const formatDateTime = (datetime) => {
  return moment(datetime).format('HH:mm - DD/MM/YYYY');
};

// Format time from now
const formatTimeFromNow = (datetime) => {
  return moment(datetime).fromNow();
};

// Get color based on priority
const getEventColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
    default: 'gray'
  };
  return colors[priority?.toLowerCase()] || colors.default;
};

// Auto refresh every minute
let refreshInterval;

onMounted(() => {
  fetchUpcomingTasks();
  
  // Refresh every minute
  refreshInterval = setInterval(() => {
    fetchUpcomingTasks();
  }, 60000); // 60000ms = 1 minute
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
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
</style>
