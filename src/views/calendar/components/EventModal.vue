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
} from "ant-design-vue";
import debounce from 'lodash/debounce';
import { DeleteOutlined } from '@ant-design/icons-vue';
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

const formState = ref({
  id: null,
  title: "",
  description: "",
  location: "",
  attendees: [], // Danh sách người tham gia (Array[String])
  sendMail: null,
  tag_id: null,

  start: null,
  end: null,
  allDay: false,
  type: "event",

  // Màu sắc
  backgroundColor: "#344599",
  borderColor: "#344599",
  color_code: "#344599",
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

  watch(
    eventData,
    (newVal) => {
      if (newVal) {
        formState.value.start = newVal.start ? dayjs(newVal.start) : null;
        formState.value.end = newVal.end ? dayjs(newVal.end) : null;
      }
    },
    { immediate: true }
); // immediate: true để chạy lần đầu tiên khi mounted


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

onMounted(() => {
  getAllTagByUser();
});

const resetForm = () => {
  formState.value = {
    id: null,
    title: "",
    description: "",
    location: "",
    attendees: [], // Danh sách người tham gia (Array[String])
    tag_id: null,

    start: null,
    end: null,
    allDay: false,
    type: "event",

    // Màu sắc
    backgroundColor: "#344599",
    borderColor: "#344599",
    color_code: "#344599",
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
    { required: true, message: "Vui lòng nhập tiêu đề sự kiện", trigger: "blur" },
    { max: 255, message: "Tiêu đề không được quá 255 ký tự", trigger: "blur" }
  ],
  start: [
    { required: true, message: "Vui lòng nhập thời gian bắt đầu", trigger: "change" },
  ],
  end: [
    { required: true, message: "Vui lòng nhập thời gian kết thúc", trigger: "change" },
    {
      validator: (_, value) => {
        if (value && dayjs(value).isBefore(dayjs(formState.value.start))) {
          return Promise.reject("Thời gian kết thúc phải sau thời gian bắt đầu.");
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
    const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).format("YYYY-MM-DD HH:mm:ss");
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
      // Giữ nguyên ngày nhưng set giờ về 00:00:00 và 23:59:59
      formState.value.start = dayjs(formState.value.start).hour(0).minute(0).second(0);
      formState.value.end = dayjs(formState.value.end).hour(23).minute(59).second(59);
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
  try {
    const dataApi = {
      title: formState.value.title,
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
  }
};

// Submit form add
const handleSubmitAdd = () => {
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
}

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
};
const handleCancel = () => {
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
    role: 'viewer'
  }));
};

// search select timezone
const filterOption = (input, option) => {
  return option.value.toLowerCase().includes(input.toLowerCase());
};

// lấy offset timezone
const getGmtOffset = (tz) => {
  const offset = moment.tz(tz).utcOffset(); // Lấy offset tính bằng phút
  return `GMT${offset >= 0 ? "+" : ""}${offset / 60}`; // Định dạng GMT
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
</script>

<template>
  <Modal :open="isAddEventModalVisible" title="Sự Kiện" @ok="handleSubmitAdd" @cancel="handleCancel"
    width="70%">
    <Form layout="vertical" :rules="rules" :model="formState" ref="formRef">
      <Row :gutter="16">
        <Col span="12">
        <Card title="Thông tin chung" size="small">
          <Form.Item label="Tiêu đề" name="title">
            <Input v-model:value="formState.title" placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea v-model:value="formState.description" placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item label="Địa điểm" name="location">
            <Input v-model:value="formState.location" placeholder="Nhập địa điểm" />
          </Form.Item>
          <div class="flex items-center gap-x-4">
            <Form.Item label="Lịch trình" name="type" class="w-1/2">
              <Select v-model:value="formState.type" placeholder="Loại sự kiện" class="w-full">
                <Select.Option value="event">Sự kiện</Select.Option>
                <Select.Option value="task">Việc cần làm</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Màu sắc" name="color_code" class="w-1/2">
              <Input type="color" v-model:value="formState.color_code" class="w-full h-10 p-1 rounded-lg" />
            </Form.Item>
            <Form.Item label="Gắn thẻ" name="tag" class="w-1/2">
              <Select v-model="formState.tag_id" placeholder="Chọn loại" class="w-full">
                <Select.Option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <label for="" v-if="formState.type == 'event'">Khách mời</label>
          <a-select
            v-model:value="formState.attendees"
            v-if="formState.type == 'event'"
            mode="multiple"
            label-in-value
            placeholder="Khách mời"
            style="width: 100%"
            :filter-option="false"
            :not-found-content="state.fetching ? undefined : null"
            :options="state.data"
            @search="fetchUser"
          >
            <template v-if="state.fetching" #notFoundContent>
              <a-spin size="small" />
            </template>
          </a-select>
        </Card>
        </Col>
        <Col span="12">
          <Card title="Thiết lập thời gian" size="small">
            <div class="flex gap-5">
              <Form.Item label="Thời gian bắt đầu" class="w-[300px]" name="start">
                <DatePicker v-model:value="formState.start" show-time class="w-full min-w-[200px]" format="YYYY-MM-DD HH:mm:ss"
                  :disabled="formState.is_all_day" />
              </Form.Item>

              <!-- Chọn múi giờ -->
              <Form.Item label="Múi giờ" name="timezone">
                <a-select
                  v-model:value="formState.timezone_code"
                  show-search
                  placeholder="Múi giờ"
                  :filter-option="filterOption"
                  class="w-full md:w-1/4"
                >
                  <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                    {{ timezone }} - {{ getGmtOffset(timezone) }}
                  </a-select-option>
                </a-select>
              </Form.Item>
            </div>
            <Form.Item label="Thời gian kết thúc" name="end" class="w-[300px]">
              <DatePicker v-model:value="formState.end" show-time class="w-full min-w-[200px]" format="YYYY-MM-DD HH:mm:ss"
                :disabled="formState.is_all_day" />
            </Form.Item>
            <!-- <Row gutter={20} align="center"> -->
            <div style="display: flex; gap: 20px; align-items: center">
              <Col>
              <Form.Item label="Cả ngày" name="is_all_day">
                <Switch v-model:checked="formState.is_all_day" />
              </Form.Item>
              </Col>
              <Col>
              <Form.Item label="Lặp lại" name="is_repeat">
                <Switch v-model:checked="formState.is_repeat" />
              </Form.Item>
              </Col>
              <Col>
              <Form.Item v-if="formState.type == 'event'" label="Bận" name="is_busy">
                <Switch v-model:checked="formState.is_busy" />
              </Form.Item>
              </Col>
              <!-- </Row> -->
            </div>
              <Col span="24">
                <div class="flex -mt-3">
                  <Form.Item label="" class="" name="is_reminder">
                    <Checkbox v-model:checked="formState.is_reminder">Bật nhắc nhở</Checkbox>
                  </Form.Item>
  
                  <Button type="dashed" v-if="formState.is_reminder" @click="addReminder">Thêm nhắc nhở</Button>
                </div>
                <div v-if="formState.is_reminder" class="mt-[-20px]">
                  
                  <div v-for="(reminder, index) in formState.reminder" :key="index" class="mb-2">
                    <Row :gutter="8">
                      <Col span="7">
                      <Select v-model:value="reminder.type">
                        <Select.Option value="email">Email</Select.Option>
                        <Select.Option value="web">Web</Select.Option>
                      </Select>
                      <span class="ml-4">trước</span>
                      </Col>
                      <Col span="5">
                        <InputNumber v-model:value="reminder.time" min="1" @blur="reminder.time = reminder.time || 1" />
                      </Col>
                      <Col span="4">
                      <Select v-model:value="reminder.unit">
                        <Select.Option value="minutes">Phút</Select.Option>
                        <Select.Option value="hours">Giờ</Select.Option>
                      </Select>
                      </Col>
                      <Col span="3">
                      <Button type="danger" class="bg-gray-100 hover:bg-gray-200 rounded cursor-pointer" @click="removeReminder(index)"><DeleteOutlined class="text-red-500 text-xl" /></Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
          </Card>
        </Col>
      </Row>
      <div class="my-2"></div>
      <template v-if="formState.is_repeat">
        <Card title="Cài đặt lặp lại" size="small">
          <div class="grid grid-cols-2 gap-6">
            <!-- Cột trái -->
            <div class="flex flex-col space-y-3">
              <Form.Item label="Kiểu lặp lại" name="freq" class="w-full">
                <Select v-model:value="formState.rrule.freq" :options="freqOptions" />
              </Form.Item>

              <Form.Item label="Ngày trong tuần" v-if="formState.rrule.freq === 'weekly'" name="byweekday" class="w-full">
                <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" />
              </Form.Item>

              <Form.Item label="Lặp vào các ngày" v-if="formState.rrule.freq === 'monthly'" name="bymonthday" class="w-full">
                <a-select
                  v-model:value="formState.rrule.bymonthday"
                  mode="multiple"
                  placeholder="Chọn ngày"
                  style="width: 100%;"
                  :options="monthDays.map(day => ({ label: `Ngày ${day}`, value: day }))"
                />
              </Form.Item>

              <Form.Item label="Khoảng cách lặp lại" name="interval" class="w-full">
                <Input 
                  v-model:value="formState.rrule.interval" 
                  type="number" 
                  min="1" 
                  @blur="formState.rrule.interval = formState.rrule.interval || 1" 
                />
              </Form.Item>
            </div>

            <!-- Cột phải -->
            <div class="flex flex-col space-y-4">
              <a-form-item label="Kết thúc" class="w-full">
                <a-radio-group v-model:value="formState.rrule.endType" class="mb-3">
                  <a-radio value="">Không bao giờ</a-radio>
                  <a-radio value="until">Ngày cụ thể</a-radio>
                  <a-radio value="count">Số lần lặp</a-radio>
                </a-radio-group>
              </a-form-item>
              <div class="flex gap-6">
                <Form.Item label="Giới hạn số lần lặp" v-if="formState.rrule.endType === 'count'" class="w-[50%]">
                  <Input v-model:value="formState.rrule.count" type="number" min="1" class="w-full"/>
                </Form.Item>
  
                <Form.Item label="Ngày kết thúc" v-if="formState.rrule.endType === 'until'" class="w-[50%]">
                  <a-date-picker v-model:value="formState.rrule.until" placeholder="Chọn ngày" class="w-full" />
                </Form.Item>

                <Form.Item label="Loại trừ ngày" name="exclude_time" class="w-[50%]">
                  <DatePicker
                    v-model:value="selectedDate"
                    format="YYYY-MM-DD"
                    class="w-full"
                    @change="handleExcludeDate"
                  />
                  <div v-if="formState.exclude_time.length">
                    <Tag
                      v-for="(date, index) in formState.exclude_time"
                      :key="index"
                      closable
                      @close="removeExcludeDate(index)"
                    >
                      {{ dayjs(date).format('YYYY-MM-DD') }}
                    </Tag>
                  </div>
                </Form.Item>
              </div>
            </div>
          </div>
        </Card>    
      </template>
    </Form>
  </Modal>
</template>
