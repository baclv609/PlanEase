<template>
  <a-card :bodyStyle="{ padding: '16px' }">
    <a-button type="primary" class="my-2" block @click="openAddCalendarModal"
      >+ {{ $t("event.create_new") }}</a-button
    >

    <div class="calendar-section">
      <MiniCalendar
        :events="filteredEvents"
        @dateSelect="handleDateSelect"
        @rangeSelect="handleRangeSelect"
        @viewChange="handleViewChange"
      />
    </div>

    <div class="mt-5">
      <h2>{{ $t("event.upcoming") }}</h2>
      <p>{{ $t("event.dont_miss") }}</p>
      <a-list :data-source="filteredEvents" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="w-full flex items-center justify-between">
              <a-badge :color="item.color" />
              <div class="event-details">
                <strong>{{ item.date }}</strong>
                <p>{{ item.name }}</p>
              </div>
              <a-tag :color="item.color">{{ item.time }}</a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div class="mt-5">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">{{ $t("event.my_calendar") }}</h3>
        <PlusOutlined
          class="cursor-pointer text-blue-500 text-xl hover:scale-110 transition-transform"
          @click="openAddCalendarModal"
        />
      </div>

      <a-checkbox-group
        v-model:value="selectedCalendars"
        class="flex flex-col gap-2"
        @change="updateFilteredEvents"
      >
        <!-- Lịch của tôi -->
        <div v-if="myCalendars.length">
          <h4 class="text-sm font-semibold text-gray-500 mb-2">
            📌 {{ $t("event.my_calendar") }}
          </h4>

          <div
            v-for="(calendar, index) in displayedCalendars"
            :key="calendar.id"
            class="flex items-center justify-between p-2 rounded-lg transition-all shadow-sm border border-gray-200 hover:shadow-md bg-white"
            :style="{ borderLeft: `4px solid ${calendar.color}` }"
          >
            <div class="flex items-center">
              <span
                :style="{
                  backgroundColor: calendar.color,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  marginRight: '8px',
                }"
              ></span>
              <a-checkbox :value="calendar.id" class="ml-2">
                <span class="text-sm font-medium text-gray-700">{{ calendar.name }}</span>
              </a-checkbox>
            </div>

            <a-dropdown>
              <EllipsisOutlined
                class="cursor-pointer text-gray-500 text-lg hover:text-black transition"
              />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="displayOnly(calendar.id)">{{
                    $t("event.show_only")
                  }}</a-menu-item>
                  <a-menu-item @click="viewDetails(calendar.id)">{{
                    $t("event.details")
                  }}</a-menu-item>
                  <a-menu-item @click="openUpdateCalendar(calendar.id)">{{
                    $t("event.edit")
                  }}</a-menu-item>
                  <a-menu-item @click="deleteCalendar(calendar.id)" style="color: red">{{
                    $t("event.delete")
                  }}</a-menu-item>
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
          <h4 class="text-sm font-semibold text-gray-500 mb-2">
            🔗 {{ $t("event.shared_calendar") }}
          </h4>
          <div
            v-for="(calendar, index) in displayedSharedCalendars"
            :key="calendar.id"
            class="flex items-center justify-between p-2 rounded-lg transition-all shadow-sm border border-gray-200 hover:shadow-md bg-white"
            :style="{ borderLeft: `5px solid ${calendar.color}` }"
          >
            <div class="flex items-center">
              <span
                :style="{
                  backgroundColor: calendar.color,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  marginRight: '8px',
                }"
              ></span>
              <a-checkbox :value="calendar.id" class="ml-2">
                <span class="text-sm font-medium text-gray-700">{{ calendar.name }}</span>
              </a-checkbox>
            </div>

            <a-dropdown>
              <EllipsisOutlined
                class="cursor-pointer text-gray-500 text-lg hover:text-black transition"
              />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="displayOnly(calendar.id)">{{
                    $t("event.show_only")
                  }}</a-menu-item>
                  <a-menu-item @click="viewDetails(calendar.id)">{{
                    $t("event.details")
                  }}</a-menu-item>
                  <a-menu-item @click="openUpdateCalendar(calendar.id)">{{
                    $t("event.edit")
                  }}</a-menu-item>
                  <a-menu-item @click="deleteCalendar(calendar.id)" style="color: red">{{
                    $t("event.delete")
                  }}</a-menu-item>
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

  <a-modal v-model:open="isModalOpenAddTag" :title="$t('event.add_tag')" @ok="handleOk">
    <a-form layout="vertical">
      <a-form-item :label="$t('event.tag_name')" required>
        <a-input
          v-model:value="newTagCalendar.name"
          :placeholder="$t('event.enter_tag_name')"
        />
      </a-form-item>
      <a-form-item :label="$t('event.color')">
        <input
          type="color"
          v-model="newTagCalendar.color"
          class="w-10 h-10 border rounded cursor-pointer"
        />
      </a-form-item>
      <a-form-item :label="$t('event.description')">
        <a-textarea
          v-model:value="newTagCalendar.description"
          :placeholder="$t('event.enter_description')"
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="isModalOpenUpdateTag"
    :title="$t('event.update_tag')"
    @ok="handleUpdateOk"
  >
    <a-form layout="vertical">
      <a-form-item :label="$t('event.tag_name')" required>
        <a-input
          v-model:value="selectedTagCalendar.name"
          :placeholder="$t('event.enter_tag_name')"
        />
      </a-form-item>
      <a-form-item :label="$t('event.color')">
        <input
          type="color"
          v-model="selectedTagCalendar.color"
          class="w-10 h-10 border rounded cursor-pointer"
        />
      </a-form-item>
      <a-form-item :label="$t('event.description')">
        <a-textarea
          v-model:value="selectedTagCalendar.description"
          :placeholder="$t('event.enter_description')"
          :rows="3"
        />
      </a-form-item>

      <a-form-item :label="$t('event.invitees')">
        <a-select
          v-model:value="selectedTagCalendar.attendees"
          mode="multiple"
          label-in-value
          :placeholder="$t('event.guests')"
          style="width: 100%"
          :filter-option="false"
          :not-found-content="state.fetching ? undefined : null"
          :options="state.data"
          @search="fetchUser"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EllipsisOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons-vue";

import dayjs from "dayjs";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useEchoStore } from "@/stores/echoStore";
import debounce from "lodash/debounce";
import MiniCalendar from "@/components/calendar/MiniCalendar.vue";
import { useSettingsStore } from "@/stores/settingsStore";

const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("access_token");

const isModalOpenAddTag = ref(false);
const isModalOpenUpdateTag = ref(false);

const newTagCalendar = ref({ name: "", color: "#1890ff", description: "" });
const selectedTagCalendar = ref({
  name: "",
  color: "#1890ff",
  description: "",
  shared_user: "",
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
  settingsStore.initialDate = date.format("YYYY-MM-DD");

  // Navigate to the day view
  router.push({
    name: "calendar-day",
    params: { year, month, day },
  });
};

const handleRangeSelect = ({ start, end, events }) => {
  if (!start || !end) return;

  // Update settings store with the start date
  settingsStore.initialDate = start.format("YYYY-MM-DD");

  // Navigate to the range view
  router.push({
    name: "calendar-range",
    params: {
      range: `${start.format("YYYY-MM-DD")}/${end.format("YYYY-MM-DD")}`,
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
  filteredEvents.value = events.value.filter((event) =>
    selectedCalendars.value.includes(event.calendarId)
  );
};

const openAddCalendarModal = () => {
  isModalOpenAddTag.value = true;
};

const displayOnly = (calendarId) => {
  selectedCalendars.value = [calendarId];
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
      message.error($t("event.error.fetch_tags"));
    }

    if (sharedTags.data.code === 200) {
      sharedCalendars.value = sharedTags.data.data;
    } else {
      message.error($t("event.error.fetch_shared_tags"));
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tags:", error);
    message.error($t("event.error.server_connection"));
  }
};

fetchCalendars();

const handleOk = async () => {
  if (!newTagCalendar.value.name) {
    message.error($t("event.error.enter_tag_name"));
    return;
  }

  const randomColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F1C40F",
    "#8E44AD",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#9B59B6",
    "#1ABC9C",
  ];

  if (!newTagCalendar.value.color) {
    newTagCalendar.value.color =
      randomColors[Math.floor(Math.random() * randomColors.length)];
  }

  try {
    const response = await axios.post(
      `${dirApi}tags`,
      {
        name: newTagCalendar.value.name,
        description: newTagCalendar.value.description,
        color_code: newTagCalendar.value.color,
        shared_user: [],
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (response.status === 201) {
      myCalendars.value.push(response.data.data);
      updateFilteredEvents();
      message.success(
        $t("event.success.tag_created", { name: newTagCalendar.value.name })
      );
      isModalOpenAddTag.value = false;

      newTagCalendar.value = { name: "", color: "#1890ff", description: "" };
    }
  } catch (error) {
    console.error("Lỗi khi thêm tag:", error);
    if (error.response) {
      if (error.response.status === 409) {
        message.error($t("event.error.tag_exists"));
      } else {
        message.error(
          $t("event.error.add_tag_error", { message: error.response.data.message })
        );
      }
    } else {
      message.error($t("event.error.server_error"));
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

    if (response.data.code === 200) {
      myCalendars.value = myCalendars.value.filter(
        (calendar) => calendar.id !== calendarId
      );
      sharedCalendars.value = sharedCalendars.value.filter(
        (calendar) => calendar.id !== calendarId
      );

      message.success($t("event.success.tag_deleted"));
    } else {
      message.error(response.data.message || $t("event.error.general_error"));
    }
  } catch (error) {
    console.error("Lỗi khi xóa tag:", error);
    message.error($t("event.error.delete_tag_error"));
  }
};

// Update
const openUpdateCalendar = (calendarId) => {
  const calendar = myCalendars.value.find((cal) => cal.id === calendarId);
  if (calendar) {
    selectedTagCalendar.value = {
      id: calendar.id,
      name: calendar.name,
      color: calendar.color_code,
      description: calendar.description,
      shared_user: calendar.shared_user ?? [],
    };
    isModalOpenUpdateTag.value = true;
  }
};

const handleUpdateOk = async () => {
  try {
    const oldTag = myCalendars.value.find(
      (tag) => tag.id === selectedTagCalendar.value.id
    );

    if (!selectedTagCalendar.value.color && oldTag) {
      selectedTagCalendar.value.color = oldTag.color_code;
    }

    const response = await axios.put(
      `${dirApi}tags/${selectedTagCalendar.value.id}`,
      { ...selectedTagCalendar.value, color_code: selectedTagCalendar.value.color },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      message.success($t("event.success.tag_updated"));
      isModalOpenUpdateTag.value = false;

      myCalendars.value = myCalendars.value.map((tag) =>
        tag.id === response.data.data.id ? response.data.data : tag
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật tag:", error);
    message.error($t("event.error.update_tag_error"));
  }
};

// Lắng nghe sự kiện real-time
onMounted(() => {
  echoStore.initEcho();
  echoStore.startListening();
});
</script>
