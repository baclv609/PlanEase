<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted } from "vue";
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
import dayjs from "dayjs";
import axios from "axios";

const props = defineProps({
  isAddEventModalVisible: Boolean,
  event: Object,
});

const eventData = computed(() => props.event || {});
console.log("eventData", eventData.value);
const formRef = ref(null);
const emit = defineEmits(["save", "cancelAddEventModalVisible"]);
const selectedDate = ref(null);

const formState = ref({
  id: null,
  title: "",
  description: "",
  location: "",
  attendees: [], // Danh sách người tham gia (Array[String])

  start: null,
  end: null,
  allDay: false,
  type: "event",

  // Màu sắc
  backgroundColor: "#00FF00",
  borderColor: "#00FF00",

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
      formState.value.end = newVal.end ? dayjs(newVal.end).add(1, "hour") : null;
    }
  },
  { immediate: true }
); // immediate: true để chạy lần đầu tiên khi mounted

const rules = {
  title: [{ required: true, message: "Vui lòng nhập tiêu đề sự kiện", trigger: "blur" }],
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
  interval: [
    {
      validator: (_, value) => {
        if (formState.value.is_repeat && (!value || value < 1)) {
          return Promise.reject("Khoảng cách lặp lại phải lớn hơn 0.");
        }
        return Promise.resolve();
      },
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
  bymonthday: [
    {
      validator: () => {
        if (formState.value.rrule?.freq === "MONTHLY") {
          if (
            formState.value.rrule.bymonthday.length > 0 &&
            formState.value.rrule.bysetpos.length > 0
          ) {
            return Promise.reject(
              "Chỉ được chọn một trong Ngày trong tháng hoặc Vị trí trong tháng."
            );
          }
        }
        return Promise.resolve();
      },
    },
  ],
};

const handleExcludeDate = (date) => {
  if (date) {
    const formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
    if (!formState.value.exclude_time.includes(formattedDate)) {
      formState.value.exclude_time.push(formattedDate);
    }
  }
};

const removeExcludeDate = (index) => {
  formState.value.exclude_time.splice(index, 1);
  console.log(
    "Danh sách ngày loại trừ:",
    JSON.stringify(formState.value.exclude_time, null, 2)
  );
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
        endType: "count", // 'count' hoặc 'until'
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
      // Nếu bật cả ngày, gán giá trị mặc định cho start_time và end_time
      formState.value.start = dayjs().startOf("day"); // 00:00:00
      formState.value.end = dayjs().endOf("day"); // 23:59:59
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
  { label: "Chủ Nhật", value: "SU" },
  { label: "Thứ Hai", value: "MO" },
  { label: "Thứ Ba", value: "TU" },
  { label: "Thứ Tư", value: "WE" },
  { label: "Thứ Năm", value: "TH" },
  { label: "Thứ Sáu", value: "FR" },
  { label: "Thứ Bảy", value: "SA" },
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

const handleSave = async () => {
  console.log(
    "Dữ liệu gốc trước khi xử lý:",
    JSON.parse(JSON.stringify(formState.value))
  );
  try {
    const dataApi = {
      title: formState.value.title,
      start_time: formState.value.start ? formState.value.start.format('YYYY-MM-DD HH:mm:ss') : null,
      end_time: formState.value.end ? formState.value.end.format('YYYY-MM-DD HH:mm:ss') : null,
      description: formState.value.description ? formState.value.description : null,
      location: formState.value.location ? formState.value.location : null,
      attendees: formState.value.attendees ? formState.value.attendees : null,
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

      freq: formState.value.rrule.freq ?? "daily", // Đúng chính tả
        interval: formState.value.rrule.interval ?? 1,
        count: formState.value.rrule.count ?? null,
        until: formState.value.rrule.until ? dayjs(formState.value.rrule.until).format('YYYY-MM-DD HH:mm:ss') : dayjs('9999-12-31 23:59:59').format('YYYY-MM-DD HH:mm:ss'),
        byweekday: formState.value.rrule.byweekday.length ? formState.value.rrule.byweekday : null,
        bymonthday: formState.value.rrule.bymonthday.length ? formState.value.rrule.bymonthday : null,
        bymonth: formState.value.rrule.bymonth.length ? formState.value.rrule.bymonth : null,
        
    };

    // if (formState.value.is_repeat && formState.value.rrule) {
    //   console.log("Dữ liệu rrule trước khi xử lý:", JSON.parse(JSON.stringify(formState.value.rrule)));

    //   const rawRrule = {
    //     freq: formState.value.rrule.freq ?? "daily", // Đúng chính tả
    //     interval: formState.value.rrule.interval ?? 1,
    //     count: formState.value.rrule.count ?? null,
    //     until: formState.value.rrule.until || null,
    //     byweekday: formState.value.rrule.byweekday.length ? formState.value.rrule.byweekday : null,
    //     bymonthday: formState.value.rrule.bymonthday.length ? formState.value.rrule.bymonthday : null,
    //     bymonth: formState.value.rrule.bymonth.length ? formState.value.rrule.bymonth : null,
        
    //   };

    //   // Chỉ lọc các trường undefined, nhưng giữ lại null (nếu cần thiết)
    //   // const filteredRrule = Object.fromEntries(
    //   //   Object.entries(rawRrule).filter(([_, v]) => v !== undefined)
    //   // );

    //   // Gán giá trị rrule vào dataApi
    //   // dataApi.rrule = filteredRrule;
    // }

    console.log("Dữ liệu để gửi API:", dataApi);
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}tasks`, dataApi, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    console.log("res", res);
  } catch (error) {
    console.log("Loi", error);
  }
};
const addReminder = () => {
  console.log("Trước khi thêm:", formState.value.reminder);
  if (!Array.isArray(formState.value.reminder)) {
    formState.value.reminder = [];
  }
  formState.value.reminder.push({ type: "email", time: 5, unit: "minutes" });
  console.log("Sau khi thêm:", formState.value.reminder);
};
const formatReminders = (reminders) => {
  return reminders.map(({ type, time, unit }) => ({
    type,
    time: unit === "hours" ? time * 60 : time, // Chuyển đổi giờ thành phút
  }));
};
const removeReminder = (index) => {
  formState.value.reminder.splice(index, 1);
};
const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <Modal :visible="isAddEventModalVisible" title="Sự Kiện" @ok="handleSave" @cancel="emit('cancelAddEventModalVisible')"
    width="50%">
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
          <Form.Item label="Loại sự kiện" name="type">
            <Select v-model:value="formState.type" placeholder="Loại sự kiện">
              <Select.Option value="event">Sự kiện</Select.Option>
              <Select.Option value="task">Việc cần làm</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Màu sắc" name="color_code">
            <Input type="color" v-model:value="formState.color_code" />
          </Form.Item>
        </Card>
        </Col>
        <Col span="12">
        <Card title="Thiết lập thời gian" size="small">
          <Form.Item label="Thời gian bắt đầu" name="start">
            <DatePicker v-model:value="formState.start" show-time format="YYYY-MM-DD HH:mm:ss"
              :disabled="formState.is_all_day" />
          </Form.Item>
          <Form.Item label="Thời gian kết thúc" name="end">
            <DatePicker v-model:value="formState.end" show-time format="YYYY-MM-DD HH:mm:ss"
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
            <Form.Item label="Bận" name="is_busy">
              <Switch v-model:checked="formState.is_busy" />
            </Form.Item>
            </Col>
            <!-- </Row> -->
          </div>
          <!-- <Form.Item label="Loại trừ ngày" name="exclude_time">
              <DatePicker
                v-model:value="selectedDate"
                format="YYYY-MM-DD"
                @change="handleExcludeDate"
              />
              <div v-if="formState.exclude_time.length">
                <Tag
                  v-for="(date, index) in formState.exclude_time"
                  :key="index"
                  closable
                  @close="removeExcludeDate(index)"
                >
                  {{ date }}
                </Tag>
              </div>
            </Form.Item> -->
        </Card>
        </Col>
      </Row>

      <Row>
        <Col span="24">
        <Card title="Nhắc nhở & Người tham gia" size="small">
          <Form.Item label="Nhắc nhở" name="is_reminder">
            <Checkbox v-model:checked="formState.is_reminder">Bật nhắc nhở</Checkbox>
          </Form.Item>
          <div v-if="formState.is_reminder">
            <div v-for="(reminder, index) in formState.reminder" :key="index">
              <Row :gutter="8">
                <Col span="8">
                <Select v-model:value="reminder.type">
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="web">Web</Select.Option>
                </Select>
                </Col>
                <Col span="8">
                <InputNumber v-model:value="reminder.time" min="1" />
                </Col>
                <Col span="6">
                <Select v-model:value="reminder.unit">
                  <Select.Option value="minutes">Phút</Select.Option>
                  <Select.Option value="hours">Giờ</Select.Option>
                </Select>
                </Col>
                <Col span="2">
                <Button type="danger" @click="removeReminder(index)">Xóa</Button>
                </Col>
              </Row>
            </div>

            <Button type="dashed" @click="addReminder">Thêm nhắc nhở</Button>
          </div>
          <Form.Item label="Người tham gia" name="attendees">
            <Select v-model:value="formState.attendees" mode="multiple" placeholder="Chọn người tham gia">
              <Select.Option value="3">User2 Example</Select.Option>
              <Select.Option value="4">User3 Example</Select.Option>
              <Select.Option value="5">User4 Example</Select.Option>
            </Select>
          </Form.Item>
        </Card>
        </Col>
      </Row>

      <template v-if="formState.is_repeat">
        <Card title="Cài đặt lặp lại" size="small">
          <Form.Item label="Kiểu lặp lại" name="freq">
            <Select v-model:value="formState.rrule.freq" :options="freqOptions" />
          </Form.Item>

          <Form.Item label="Khoảng cách lặp lại" name="interval">
            <Input v-model:value="formState.rrule.interval" type="number" min="1" />
          </Form.Item>

          <Form.Item label="Ngày trong tuần" v-if="formState.rrule.freq === 'weekly'" name="byweekday">
            <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" />
          </Form.Item>

          <Form.Item label="Ngày" v-if="formState.rrule.freq === 'monthly' || formState.rrule.freq === 'yearly'"
            name="bymonthday">
            <Checkbox.Group v-model:value="formState.rrule.bymonthday" :options="monthDays" />
          </Form.Item>

          <Form.Item label="Tháng" v-if="formState.rrule.freq === 'yearly'" name="bymonth">
            <Checkbox.Group v-model:value="formState.rrule.bymonth" :options="months" />
          </Form.Item>

          <a-form-item label="Kết thúc">
            <a-radio-group v-model:value="formState.rrule.endType" class="mb-3">
              <a-radio value="count">Số lần lặp</a-radio>
              <a-radio value="until">Ngày cụ thể</a-radio>
            </a-radio-group>

            <Form.Item label="Giới hạn số lần lặp" v-if="formState.rrule.endType === 'count'">
              <Input v-model:value="formState.rrule.count" type="number" min="1" />
            </Form.Item>
            <Form.Item label="Ngày kết thúc" v-if="formState.rrule.endType === 'until'">
              <a-date-picker v-model:value="formState.rrule.until" placeholder="Chọn ngày" />
            </Form.Item>
          </a-form-item>
        </Card>
      </template>
    </Form>
  </Modal>
</template>
