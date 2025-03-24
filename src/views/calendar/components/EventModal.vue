<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted, h } from "vue";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  TimePicker,
  Button,
  Checkbox,
  Card,
  Row,
  Col,
  InputNumber,
  Radio,
  message,
  Tag,
  Drawer,
  Upload,
} from "ant-design-vue";
import debounce from 'lodash/debounce';
import { 
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  LinkOutlined,
} from '@ant-design/icons-vue';
import moment from "moment-timezone";
import dayjs from "dayjs";
import axios from "axios";

const props = defineProps({
  isAddEventModalVisible: Boolean,
  event: Object,
  AddEventModalSuccess: Object,
});

const eventData = computed(() => props.event || {});
const formRef = ref(null);
const emit = defineEmits(["save", 'cancel',"cancelAddEventModalVisible", 'AddEventModalSuccess']);
const selectedDate = ref(null);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const timezones = moment.tz.names();
const tags = ref([]);
const isLoading = ref(false);

const colors = [
  { label: 'Xanh dương', value: '#1890ff' }, 
  { label: 'Đỏ', value: '#ff4d4f' }, 
  { label: 'Xanh lá cây', value: '#52c41a' },
  { label: 'Vàng', value: '#faad14' }, 
  { label: 'Tím', value: '#722ed1' },
  { label: 'Xám', value: '#bfbfbf' }, 
  { label: 'Cam', value: '#fa541c' }, 
  { label: 'Hồng', value: '#eb2f96' }, 
  { label: 'Nâu', value: '#a97c50' }, 
  { label: 'Xanh ngọc', value: '#13c2c2' }, 
  { label: 'Xanh lục bảo', value: '#237804' }, 
  { label: 'Xanh biển', value: '#003a8c' },
  { label: 'Đen', value: '#000000' }
];

const formState = ref({
  id: null,
  title: "",
  description: "",
  location: "",
  attendees: [], // Danh sách người tham gia (Array[String])
  sendMail: null,
  tag_id: null,
  role: 'viewer', // Thêm role mặc định là viewer
  is_private: 0,
  start: null,
  end: null,
  allDay: false,
  type: "event",
  attachments: [], // Thêm trường attachments
  link: null,

  // Màu sắc
  backgroundColor: colors[0].value,
  borderColor: colors[0].value,
  color_code: colors[0].value,
  // Nhắc nhở (Reminders)
  is_reminder: false, // Có bật nhắc nhở không? (Boolean)
  reminder_time: [], // Thời gian nhắc nhở (String - "HH:mm")
  reminder: [], // Danh sách nhắc nhở (Array[Object])

  // Lặp lại sự kiện (Recurring Rule - RRule)
  is_repeat: false,
  rrule: null,

  // Metadata mở rộng (Extended Props của FullCalendar)
  extendedProps: {
    createdBy: "", // Người tạo sự kiện (String - Email)
    lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
    notes: "", // Ghi chú bổ sung (String)
  },
  event_type: "", // Công việc, Cuộc họp, Sự kiện khác
  exclude_time: [],
  timezone_code: localStorage.getItem("userSettings")
    ? JSON.parse(localStorage.getItem("userSettings")).timeZone
    : "Asia/Saigon",
});

// Lấy tag của người dùng
const getAllTagByUser = async () => {
  try {
    const res = await axios.get(`${dirApi}tags`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if(res.data.code == 200) {
      tags.value = res.data.data;
    }
  } catch (error) {
    console.log('Loi lay tags', error);
  }
}

// Add watcher for isAddEventModalVisible
watch(
  () => props.isAddEventModalVisible,
  (newVal) => {
    if (newVal) {
      getAllTagByUser();
    }
  },
  { immediate: true }
);

watch(
  eventData,
  (newVal) => {
    if (newVal) {
      formState.value.start = newVal.start ? dayjs(newVal.start) : null;
      formState.value.end = newVal.end ? dayjs(newVal.end) : null;
      formState.value.is_all_day = newVal.allDay;
    }
  },
  { immediate: true }
);

watch(
  () => formState.value.is_private,
  (newVal) => {
    if(newVal) {
      formState.value.attendees = [];
    }
  }
)

onMounted(() => {
  if(props.isAddEventModalVisible) {
    // Set default color
    formState.value.color_code = colors[0].value;
    formState.value.backgroundColor = colors[0].value;
    formState.value.borderColor = colors[0].value;
  }
});

const resetForm = () => {
  formState.value = {
    id: null,
    title: "",
    description: "",
    location: "",
    attendees: [], // Danh sách người tham gia (Array[String])
    tag_id: null,
    role: 'viewer', // Thêm role mặc định là viewer
    is_private: false,
    start: null,
    end: null,
    allDay: false,
    type: "event",
    attachments: [], // Thêm trường attachments

    // Màu sắc
    backgroundColor: colors[0].value,
    borderColor: colors[0].value,
    color_code: colors[0].value,
    // Nhắc nhở (Reminders)
    is_reminder: false, // Có bật nhắc nhở không? (Boolean)
    reminder_time: [], // Thời gian nhắc nhở (String - "HH:mm")
    reminder: [], // Danh sách nhắc nhở (Array[Object])

    // Lặp lại sự kiện (Recurring Rule - RRule)
    is_repeat: false,
    rrule: null,

    // Metadata mở rộng (Extended Props của FullCalendar)
    extendedProps: {
      createdBy: "", // Người tạo sự kiện (String - Email)
      lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
      notes: "", // Ghi chú bổ sung (String)
    },
    event_type: "", // Công việc, Cuộc họp, Sự kiện khác
    exclude_time: [],
    timezone_code: localStorage.getItem("userSettings")
      ? JSON.parse(localStorage.getItem("userSettings")).timeZone
      : "Asia/Saigon",
    }
  }

const rules = {
  title: [
    { max: 255, message: "Tiêu đề không được quá 255 ký tự", trigger: "blur" }
  ],
  start: [
    { required: true, message: "Vui lòng nhập thời gian bắt đầu", trigger: "change" },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject("Vui lòng chọn ngày bắt đầu");
        }
        return Promise.resolve();
      },
      trigger: "change"
    }
  ],
  end: [
    { required: true, message: "Vui lòng nhập thời gian kết thúc", trigger: "change" },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject("Vui lòng chọn ngày kết thúc");
        }
        if (formState.value.is_all_day) {
          // Nếu là cả ngày, kiểm tra ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày
          const startDate = dayjs(formState.value.start).startOf('day');
          const endDate = dayjs(value).startOf('day');
          if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
            return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu");
          }
        } else {
          // Nếu không phải cả ngày, kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
          if (dayjs(value).isBefore(dayjs(formState.value.start))) {
            return Promise.reject("Thời gian kết thúc không hợp lệ");
          }
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
  byweekday: [
    {
      validator: () => {
        if (formState.value.is_repeat && formState.value.rrule?.freq === "WEEKLY") {
          if (formState.value.rrule.byweekday.length === 0) {
            return Promise.reject("Chọn ít nhất một ngày trong tuần.");
          }
        }
        return Promise.resolve();
      },
    },
  ],
};

const handleExcludeDate = (date) => {
  if (date) {
    const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).second(0).format("YYYY-MM-DD HH:mm:ss");
    if (!formState.value.exclude_time.includes(formattedDate)) {
      formState.value.exclude_time.push(formattedDate);
    }
  }
};

const removeExcludeDate = (index) => {
  formState.value.exclude_time.splice(index, 1);
};
//  Watch khi người dùng bật/tắt chế độ lặp lại
watch(
  () => formState.value.is_repeat,
  (newValue) => {
    if (newValue) {
      // Nếu bật lặp lại, tạo rrule mặc định
      formState.value.rrule = {
        freq: "daily",
        interval: 1,
        count: null,
        until: null,
        byweekday: [],
        bymonthday: [],
        bymonth: [],
        bysetpos: [],
        endType: "", // 'count' hoặc 'until'
      };
    } else {
      // Nếu tắt, xóa rrule
      formState.value.rrule = null;
    }
  },
  { immediate: true }
);

watch(
  () => formState.value.is_all_day,
  (newValue) => {
    if (newValue) {
      // Khi bật cả ngày
      if (formState.value.start) {
        formState.value.start = dayjs(formState.value.start).startOf('day');
        formState.value.end = dayjs(formState.value.end).add(1, 'day').startOf('day');
    }
  }
}
);

const freqOptions = [
  { label: "Hàng ngày", value: "daily" },
  { label: "Hàng tuần", value: "weekly" },
  { label: "Hàng tháng", value: "monthly" },
  { label: "Hàng năm", value: "yearly" },
];

const weekDays = [
  { label: "T2", value: "MO" },
  { label: "T3", value: "TU" },
  { label: "T4", value: "WE" },
  { label: "T5", value: "TH" },
  { label: "T6", value: "FR" },
  { label: "T7", value: "SA" },
  { label: "CN", value: "SU" },
];

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

watch(
  () => formState.value?.rrule?.endType,
  (newVal) => {
    if (newVal === "count") {
      formState.value.rrule.until = null;
    } else if (newVal === "until") {
      formState.value.rrule.count = null;
    }
  }
);

// Xử lý thêm
const handleSave = async () => {
  isLoading.value = true;
  try {
    const dataApi = {
      title: formState.value.title || 'Không có tiêu đề',
      start_time: formState.value.start
        ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
        : null,
      end_time: formState.value.end
        ? formState.value.end.format("YYYY-MM-DD HH:mm:ss")
        : null,
      description: formState.value.description ? formState.value.description : null,
      location: formState.value.location ? formState.value.location : null,
      attendees: formState.value.attendees ? transformAttendeesData(formState.value.attendees) : null,
      sendMail: formState.value.sendMail,
      is_reminder: formState.value.is_reminder || 0,
      reminder: formatReminders(formState.value.reminder) || null,
      color_code: formState.value.color_code || null,
      borderColor: formState.value.borderColor || null,
      is_all_day: formState.value.is_all_day || 0,
      is_repeat: formState.value.is_repeat || 0,
      rrule: formState.value.rrule || null,
      exclude_time: formState.value.exclude_time || null,
      timezone_code: formState.value.timezone_code ? formState.value.timezone_code : null,
      type: formState.value.type ? formState.value.type : null,
      tag_id: formState.value.tag_id || null,
      is_private: formState.value.is_private || 0,

      freq: formState.value.rrule?.freq ? formState.value.rrule?.freq : null,
      interval: formState.value.rrule?.interval ?? 1,
      count: formState.value.rrule?.count ?? null,
      until: formState.value.rrule?.until
        ? dayjs(formState.value.rrule?.until).format("YYYY-MM-DD HH:mm:ss")
        : dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
      byweekday: formState.value.rrule?.byweekday.length
        ? formState.value.rrule.byweekday
        : null,
      bymonthday: formState.value.rrule?.bymonthday.length
        ? formState.value.rrule.bymonthday
        : null,
      bymonth: formState.value.rrule?.bymonth.length
        ? formState.value.rrule.bymonth
        : null,
    };

    console.log(dataApi);

    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}tasks`, dataApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (res.data.code === 200) {
      message.success(res.data.message || "Thêm sự kiện thành công");
      emit("save", dataApi);
      resetForm();
      emit("cancel");
    }

  } catch (error) {
    console.log("Loi", error);
  } finally {
    isLoading.value =false;
  }
};

// Submit form add
const handleSubmitAdd = async () => {
  try {
    // Kiểm tra validation trước khi tiếp tục
    await formRef.value.validate();
    
    if (formState.value.attendees.length > 0) {
      Modal.confirm({
        title: "Gửi email thông báo?",
        content: "Bạn có muốn gửi email thông báo cho những người tham gia không?",
        okText: "Gửi",
        width: 600,
        onCancel() {
          Modal.destroyAll()
        },
        footer: () =>
          h("div", { class: "w-full flex justify-end space-x-4 p-4" }, [
            // Nút "Quay lại"
            h("button",
              {
                class: "text-gray-500 hover:text-gray-700 border-0 px-4 py-2 cursor-pointer font-semibold rounded-lg transition duration-200 text-sm",
                onClick: () => Modal.destroyAll(),
              },"Quay lại"),

            // Nút "Không gửi"
            h(
              "button",
              {
                class: "text-red-500 hover:text-red-700 border-0 rounded-lg px-4 py-2 cursor-pointer font-semibold transition duration-200 text-sm",
                onClick: () => {
                  formState.value.sendMail = "no";
                  Modal.destroyAll();
                  handleSave();
                },
              },
              "Không gửi"
            ),

            // Nút "Gửi"
            h(
              "button",
              {
                class: "text-blue-500 hover:text-blue-700 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer font-semibold border-0 transition duration-200 text-sm",
                onClick: () => {
                  formState.value.sendMail = "yes";
                  Modal.destroyAll();
                  handleSave();
                },
              },
              "Gửi"
            ),
          ]),
      });
    } else {
      // Nếu không có attendees, gửi luôn
      handleSave();
    }
  } catch (error) {
    
  }
};

const addReminder = () => {
  if (!Array.isArray(formState.value.reminder)) {
    formState.value.reminder = [];
  }

  if (formState.value.reminder.length < 3) {
    formState.value.reminder.push({ type: "email", time: 5, unit: "minutes" });
  } else {
    message.warning('Chỉ được thêm tối đa 3 thông báo nhắc trước lịch');
  }
};
const formatReminders = (reminders) => {
  if (!Array.isArray(reminders)) {
    return [];
  }

  const formattedReminders = reminders.map(({ type, time, unit }) => ({
    type,
    set_time: unit === "hours" ? time * 60 : time, // Chuyển đổi giờ thành phút
  }));

  // Loại bỏ các phần tử trùng lặp
  return formattedReminders.filter((reminder, index, self) =>
    index === self.findIndex((r) => r.type === reminder.type && r.set_time === reminder.set_time)
  );
};
const removeReminder = (index) => {
  formState.value.reminder.splice(index, 1);
  // Tắt nhắc nhở nếu không còn reminder nào
  if (formState.value.reminder.length == 0) {
    formState.value.is_reminder = false;
  }
};
const handleCancel = () => {
  formRef.value?.clearValidate();
  resetForm();
  emit("cancel");
};

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

// Reset data khi component thay đổi
watch(state, () => {
  state.value.data = [];
  state.value.fetching = false;
});

// Format lại mảng của người tham gia
const transformAttendeesData = (data) => {
  return data.map(option => ({
    user_id: option.value,
    status: 'pending',
    role: formState.value.role
  }));
};

// search select timezone
const filterOption = (input, option) => {
  return option.value.toLowerCase().includes(input.toLowerCase());
};

// lấy offset timezone
const getGmtOffset = (tz) => {
  const offset = moment.tz(tz).utcOffset(); // Lấy offset tính bằng phút
  return `UTC${offset >= 0 ? "+" : ""}${offset / 60}`; // Định dạng UTC
};

// cập nhật giờ thông báo
watch(
  () => formState.value.reminder,
  (newReminders) => {
    newReminders.forEach((reminder) => {
      if (reminder.unit === "hours" && reminder.time > 24) {
        message.info('Chỉ được thông báo trước 24 giờ');
        reminder.time = 24; // Giới hạn tối đa 24 giờ
      }
      if (reminder.unit === "minutes" && reminder.time > 60) {
        reminder.unit = "hours"; // Chuyển sang giờ
        reminder.time = Math.floor(reminder.time / 60); // Chuyển đổi thành giờ
      }
    });
  },
  { deep: true }
);

// Cập nhật các trường về dạng mặc định khi đổi qua loại sự kiện là task
const resetEventSpecificFields = () => {
  formState.value.attendees = [];
  formState.value.is_busy = false;
};

// chọn thứ mặc định khi chọn lặp tuần
watch(
  () => formState.value.rrule?.freq,
  (newVal) => {
    if (newVal === 'weekly' && formState.value.start) {
      const startDay = dayjs(formState.value.start).day();
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    } else if (newVal === 'monthly' && formState.value.start) {
      // Lấy ngày trong tháng từ ngày bắt đầu
      const startDay = dayjs(formState.value.start).date();
      formState.value.rrule.bymonthday = [startDay];
    }
  }
);

// chọn mặc định thứ của ngày bắt đầu khi không chọn thứ
watch(
  () => formState.value.rrule?.byweekday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'weekly' && (!newVal || newVal.length === 0) && formState.value.start) {
      
      const startDay = dayjs(formState.value.start).day();
      
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    }
  }
);

watch(
  () => formState.value.rrule?.bymonthday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'monthly' && (!newVal || newVal.length === 0) && formState.value.start) {
      // Lấy ngày trong tháng từ ngày bắt đầu
      const startDay = dayjs(formState.value.start).date();
      formState.value.rrule.bymonthday = [startDay];
    }
  }
);
</script>

<template>
  <Drawer 
    :open="isAddEventModalVisible" 
    title="Thêm Sự Kiện Mới" 
    @close="handleCancel"
    width="65%"
    class="event-drawer"
  >
    <template #extra>
      <Button type="primary" @click="handleSubmitAdd" class="rounded-md" :loading="isLoading">Lưu</Button>
    </template>
    <Form layout="vertical" :rules="rules" :model="formState" ref="formRef">
      <div class="h-full flex flex-col">
        <div class="flex-1">
          <Row :gutter="[16, 16]">
            <Col :span="13">
              <Card 
                title="Thông tin chung" 
                size="small" 
                class="h-full"
                :bordered="false"
              >
                <Form.Item label="Tiêu đề" name="title" class="mb-3">
                  <Input v-model:value="formState.title" placeholder="Nhập tiêu đề sự kiện" class="rounded-md">
                    <template #prefix>
                      <EditOutlined class="text-gray-400" />
                    </template>
                  </Input>
                </Form.Item>
                <Form.Item label="Mô tả" name="description" class="mb-3">
                  <Input.TextArea 
                    v-model:value="formState.description" 
                    placeholder="Nhập mô tả" 
                    :rows="2" 
                    class="rounded-md" 
                  />
                </Form.Item>
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-sm text-gray-700">Tệp đính kèm</span>
                  <Upload
                    v-model:file-list="formState.attachments"
                    :before-upload="() => false"
                    multiple
                    :max-count="5"
                    class="flex-1"
                  >
                    <Button class="rounded-md">
                      <UploadOutlined /> Tải lên
                    </Button>
                    <template #itemRender="{ file, actions }">
                      <div class="flex items-center justify-between w-full">
                        <span class="truncate">{{ file.name }}</span>
                        <CloseCircleOutlined @click="actions.remove" class="text-gray-400 hover:text-red-500" />
                      </div>
                    </template>
                  </Upload>
                </div>
                <Form.Item label="Địa điểm" name="location" class="mb-3">
                  <Input v-model:value="formState.location" placeholder="Nhập địa điểm" class="rounded-md">
                    <template #prefix>
                      <EnvironmentOutlined class="text-gray-400" />
                    </template>
                  </Input>
                </Form.Item>

                <Form.Item label="Liên kết" name="link" class="mb-3">
                  <Input v-model:value="formState.link" placeholder="Nhập URL" class="rounded-md">
                    <template #prefix>
                      <LinkOutlined class="text-gray-400" />
                    </template>
                  </Input>
                </Form.Item>

                <div class="grid grid-cols-3 gap-3 mb-3">
                  <Form.Item label="Lịch trình" name="type" class="mb-0">
                    <Select v-model:value="formState.type" placeholder="Loại sự kiện" class="rounded-md">
                      <Select.Option value="event">Sự kiện</Select.Option>
                      <Select.Option value="task">Việc cần làm</Select.Option>
                    </Select>
                  </Form.Item>

                  <a-form-item label="Chọn màu" name="color_code" class="mb-0">
                    <a-select v-model:value="formState.color_code" placeholder="Chọn màu">
                        <a-select-option v-for="color in colors" :key="color.value" :value="color.value">
                            <div class="flex items-center">
                                <div class="w-4 h-4 mr-2 rounded-full" :style="{ backgroundColor: color.value }"></div>
                                <span>{{ color.label }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                  </a-form-item>

                  <Form.Item label="Gắn thẻ" name="tag" class="mb-0">
                    <Select v-model:value="formState.tag_id" placeholder="Chọn loại" class="rounded-md">
                      <Select.Option v-for="tag in tags" :key="tag.id" :value="tag.id">
                        {{ tag.name }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div v-if="formState.type == 'event'">
                  <Form.Item label="Khách mời" class="mb-2">
                    <a-select
                      v-model:value="formState.attendees"
                      mode="multiple"
                      label-in-value
                      placeholder="Thêm khách mời"
                      class="rounded-md"
                      :filter-option="false"
                      :not-found-content="state.fetching ? undefined : null"
                      :options="state.data"
                      @search="fetchUser"
                    >
                      <template #prefix>
                        <TeamOutlined class="text-gray-400" />
                      </template>
                      <template v-if="state.fetching" #notFoundContent>
                        <a-spin size="small" />
                      </template>
                    </a-select>
                  </Form.Item>
                  <div class="flex items-center gap-2">
                    <span>Quyền khách mời:</span>
                    <a-radio-group v-model:value="formState.role" class="flex gap-4">
                      <a-radio value="viewer">Chỉ xem</a-radio>
                      <a-radio value="editor">Được sửa</a-radio>
                    </a-radio-group>
                  </div>
                </div>
              </Card>
            </Col>
            <Col :span="11">
              <Card 
                title="Thiết lập thời gian" 
                size="small" 
                class="h-full"
                :bordered="false"
              >
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <Form.Item label="Thời gian bắt đầu" name="start" class="mb-0">
                    <DatePicker 
                      v-model:value="formState.start" 
                      :show-time="!formState.is_all_day"
                      class="w-full rounded-md" 
                      format="YYYY-MM-DD HH:mm"
                      :disabled-time="formState.is_all_day ? () => ({ disabledHours: () => Array.from({ length: 24 }, (_, i) => i) }) : undefined"
                      :allow-clear="false"
                    >
                      <template #prefix>
                        <CalendarOutlined class="text-gray-400" />
                      </template>
                    </DatePicker>
                  </Form.Item>
                  <Form.Item label="Thời gian kết thúc" name="end" class="mb-0">
                    <DatePicker 
                      v-model:value="formState.end" 
                      :show-time="!formState.is_all_day"
                      class="w-full rounded-md" 
                      format="YYYY-MM-DD HH:mm"
                      :disabled-time="formState.is_all_day ? () => ({ disabledHours: () => Array.from({ length: 24 }, (_, i) => i) }) : undefined"
                      :allow-clear="false"
                    >
                      <template #prefix>
                        <CalendarOutlined class="text-gray-400" />
                      </template>
                    </DatePicker>
                  </Form.Item>
                </div>
                <Form.Item label="Múi giờ" name="timezone" class="mb-3">
                  <a-select
                    v-model:value="formState.timezone_code"
                    show-search
                    placeholder="Chọn múi giờ"
                    :filter-option="filterOption"
                    class="w-full rounded-md"
                  >
                    <template #prefix>
                      <GlobalOutlined class="text-gray-400" />
                    </template>
                    <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                      {{ timezone }} - {{ getGmtOffset(timezone) }}
                    </a-select-option>
                  </a-select>
                </Form.Item>
                <div class="grid grid-cols-4 gap-3 mb-3">
                  <Form.Item label="Cả ngày" name="is_all_day" class="mb-0">
                    <Switch v-model:checked="formState.is_all_day" />
                  </Form.Item>
                  <Form.Item label="Lặp lại" name="is_repeat" class="mb-0">
                    <Switch v-model:checked="formState.is_repeat" />
                  </Form.Item>
                  <Form.Item label="Riêng tư" v-if="formState.type == 'event'" name="is_private" class="mb-0">
                    <Switch v-model:checked="formState.is_private" />
                  </Form.Item>
                  <Form.Item v-if="formState.type == 'event'" label="Bận" name="is_busy" class="mb-0">
                    <Switch v-model:checked="formState.is_busy" />
                  </Form.Item>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center gap-2" v-if="formState.type == 'event'">
                    <Form.Item name="is_reminder" class="mb-0">
                      <Checkbox v-model:checked="formState.is_reminder">Bật nhắc nhở</Checkbox>
                    </Form.Item>
                    <Button 
                      type="dashed" 
                      v-if="formState.is_reminder" 
                      @click="addReminder" 
                      class="rounded-md text-sm flex items-center"
                    >
                      <BellOutlined class="mr-1" />Thêm nhắc nhở
                    </Button>
                  </div>
                  <div v-if="formState.is_reminder" class="space-y-2">
                    <div v-for="(reminder, index) in formState.reminder" :key="index" class="flex items-center gap-2">
                      <Select v-model:value="reminder.type" class="w-24 rounded-md">
                        <Select.Option value="email">Email</Select.Option>
                        <Select.Option value="web">Web</Select.Option>
                      </Select>
                      <span class="text-sm text-gray-500">trước</span>
                      <InputNumber 
                        v-model:value="reminder.time" 
                        min="1" 
                        class="w-16 rounded-md" 
                        @blur="reminder.time = reminder.time || 1" 
                      />
                      <Select v-model:value="reminder.unit" class="w-24 rounded-md">
                        <Select.Option value="minutes">Phút</Select.Option>
                        <Select.Option value="hours">Giờ</Select.Option>
                      </Select>
                      <Button 
                        type="text" 
                        danger 
                        @click="removeReminder(index)"
                        class="flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-50"
                      >
                        <DeleteOutlined class="text-red-500 text-lg" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <template v-if="formState.is_repeat">
            <Card 
              title="Cài đặt lặp lại" 
              size="small" 
              class="mt-4"
              :bordered="false"
            >
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-3">
                  <Form.Item label="Kiểu lặp lại" name="freq" class="mb-0">
                    <Select v-model:value="formState.rrule.freq" :options="freqOptions" class="rounded-md">
                      <template #prefix>
                        <ReloadOutlined class="text-gray-400" />
                      </template>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Ngày trong tuần" v-if="formState.rrule.freq === 'weekly'" name="byweekday" class="mb-0">
                    <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" class="grid grid-cols-4 gap-2" />
                  </Form.Item>

                  <Form.Item label="Lặp vào các ngày" v-if="formState.rrule.freq === 'monthly'" name="bymonthday" class="mb-0">
                    <a-select
                      v-model:value="formState.rrule.bymonthday"
                      mode="multiple"
                      placeholder="Chọn ngày"
                      class="w-full rounded-md"
                      :options="monthDays.map(day => ({ label: `Ngày ${day}`, value: day }))"
                    >
                      <template #prefix>
                        <ScheduleOutlined class="text-gray-400" />
                      </template>
                    </a-select>
                  </Form.Item>

                  <Form.Item label="Khoảng cách lặp lại" name="interval" class="mb-0">
                    <Input 
                      v-model:value="formState.rrule.interval" 
                      type="number" 
                      min="1" 
                      class="rounded-md"
                      @blur="formState.rrule.interval = formState.rrule.interval || 1" 
                    >
                      <template #prefix>
                        <SyncOutlined class="text-gray-400" />
                      </template>
                    </Input>
                  </Form.Item>
                </div>

                <div class="space-y-3">
                  <Form.Item label="Kết thúc" class="mb-0">
                    <a-radio-group v-model:value="formState.rrule.endType" class="flex gap-4">
                      <a-radio value="">Không bao giờ</a-radio>
                      <a-radio value="until">Ngày cụ thể</a-radio>
                      <a-radio value="count">Số lần lặp</a-radio>
                    </a-radio-group>
                  </Form.Item>

                  <div class="grid grid-cols-2 gap-3">
                    <Form.Item label="Loại trừ ngày" name="exclude_time" class="mb-0">
                      <DatePicker
                        v-model:value="selectedDate"
                        format="YYYY-MM-DD"
                        class="w-full rounded-md mb-2"
                        @change="handleExcludeDate"
                      >
                        <template #prefix>
                          <CalendarOutlined class="text-gray-400" />
                        </template>
                      </DatePicker>
                      <div class="flex flex-wrap gap-1">
                        <Tag
                          v-for="(date, index) in formState.exclude_time"
                          :key="index"
                          closable
                          @close="removeExcludeDate(index)"
                          class="rounded-md"
                        >
                          {{ dayjs(date).format('YYYY-MM-DD') }}
                        </Tag>
                      </div>
                    </Form.Item>

                    <Form.Item label="Giới hạn số lần lặp" v-if="formState.rrule.endType === 'count'" class="mb-0">
                      <Input v-model:value="formState.rrule.count" type="number" min="1" class="rounded-md">
                        <template #prefix>
                          <CheckSquareOutlined class="text-gray-400" />
                        </template>
                      </Input>
                    </Form.Item>
      
                    <Form.Item label="Ngày kết thúc" v-if="formState.rrule.endType === 'until'" class="mb-0">
                      <a-date-picker v-model:value="formState.rrule.until" placeholder="Chọn ngày" class="w-full rounded-md">
                        <template #prefix>
                          <CalendarOutlined class="text-gray-400" />
                        </template>
                      </a-date-picker>
                    </Form.Item>
                  </div>

                </div>
              </div>
            </Card>    
          </template>
        </div>

      </div>
    </Form>
  </Drawer>
</template>

<style scoped>
.event-drawer :deep(.ant-drawer-content-wrapper) {
  max-width: 80%;
}

.event-drawer :deep(.ant-drawer-content) {
  overflow: hidden;
}

.event-drawer :deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}

.event-drawer :deep(.ant-drawer-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.event-drawer :deep(.ant-drawer-body) {
  padding: 16px;
  height: calc(100% - 55px);
  overflow: hidden;
}

.event-drawer :deep(.ant-form) {
  height: 100%;
  overflow: hidden;
}

.event-drawer :deep(.flex-1) {
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.event-drawer :deep(.ant-row) {
  margin: 0 !important;
  width: 100%;
}

.event-drawer :deep(.ant-col) {
  padding: 0 8px !important;
}

.event-drawer :deep(.ant-card) {
  margin-bottom: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-drawer :deep(.ant-card-body) {
  padding: 12px;
}

.event-drawer :deep(.ant-form-item) {
  margin-bottom: 12px;
  width: 100%;
}

.event-drawer :deep(.ant-input),
.event-drawer :deep(.ant-select-selector),
.event-drawer :deep(.ant-picker) {
  border-radius: 4px !important;
  height: 32px !important;
  border-color: #d9d9d9;
  width: 100%;
}

.event-drawer :deep(.ant-input:hover),
.event-drawer :deep(.ant-select-selector:hover),
.event-drawer :deep(.ant-picker:hover) {
  border-color: #4096ff;
}

.event-drawer :deep(.ant-input-textarea textarea) {
  height: 60px !important;
  border-radius: 4px;
}

.event-drawer :deep(.ant-btn) {
  border-radius: 4px;
  height: 32px;
  font-weight: 500;
}

.event-drawer :deep(.ant-tag) {
  border-radius: 4px;
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #595959;
}

.event-drawer :deep(.ant-checkbox-wrapper) {
  margin-right: 0 !important;
  font-size: 13px;
}

.event-drawer :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selector) {
  padding: 0 4px !important;
  min-height: 32px;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selection-item) {
  margin: 2px 4px;
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  border-radius: 4px;
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-drawer :deep(.ant-select-multiple .ant-select-selection-item-remove) {
  margin-left: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-input-number) {
  width: 100% !important;
}

.event-drawer :deep(.ant-input-number-input) {
  height: 30px !important;
}

.event-drawer :deep(.ant-switch) {
  height: 20px;
  min-width: 36px;
}

.event-drawer :deep(.ant-switch-inner) {
  height: 16px;
  font-size: 12px;
}

.event-drawer :deep(.ant-radio-wrapper) {
  font-size: 13px;
}

.event-drawer :deep(.ant-select-selection-item) {
  font-size: 13px;
}

.event-drawer :deep(.ant-select-selection-placeholder) {
  font-size: 13px;
  line-height: 30px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-input-affix-wrapper) {
  border-radius: 4px !important;
}

.event-drawer :deep(.ant-input-affix-wrapper .ant-input) {
  height: 32px !important;
}

.event-drawer :deep(.ant-input-affix-wrapper .ant-input-prefix) {
  margin-right: 8px;
  color: #8c8c8c;
}

.event-drawer :deep(.ant-select .ant-select-selector .ant-select-selection-item) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-drawer :deep(.ant-select .ant-select-selector .ant-select-selection-item .anticon) {
  margin-right: 4px;
}

.event-drawer :deep(.ant-picker-time-panel) {
  display: none !important;
}

.event-drawer :deep(.ant-picker-time-panel-column) {
  display: none !important;
}
</style>
