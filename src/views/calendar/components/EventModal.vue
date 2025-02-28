<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
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
} from "ant-design-vue";
import dayjs from "dayjs";

const props = defineProps({
  isAddEventModalVisible: Boolean,
  event: Object,
});

const emit = defineEmits(["save", "cancelAddEventModalVisible"]);

const formState = ref({
  // Thông tin sự kiện
  id: null, // ID của sự kiện (nếu có)
  title: "", // Tiêu đề sự kiện (String)
  description: "", // Mô tả sự kiện (String)
  location: "", // Địa điểm (String)
  attendees: [], // Danh sách người tham gia (Array[String])

  // Thời gian sự kiện
  start: null, // Ngày giờ bắt đầu (String - ISO 8601)
  end: null, // Ngày giờ kết thúc (String - ISO 8601)
  allDay: false, // Có phải sự kiện cả ngày không? (Boolean)

  // Màu sắc
  backgroundColor: "#00FF00", // Màu nền của sự kiện (String - HEX)
  borderColor: "#00FF00", // Màu viền sự kiện (String - HEX)

  // Nhắc nhở (Reminders)
  is_reminder: false, // Có bật nhắc nhở không? (Boolean)
  reminder_time: null, // Thời gian nhắc nhở (String - "HH:mm")

  // Lặp lại sự kiện (Recurring Rule - RRule)
  is_repeat: false, // Có bật chế độ lặp lại không? (Boolean)
  rrule: null, // Cấu hình lặp lại nếu có (Object hoặc null)

  // Metadata mở rộng (Extended Props của FullCalendar)
  extendedProps: {
    createdBy: "", // Người tạo sự kiện (String - Email)
    lastUpdated: null, // Thời gian cập nhật cuối (String - ISO 8601)
    notes: "", // Ghi chú bổ sung (String)
  },
});

//  Watch khi người dùng bật/tắt chế độ lặp lại
watch(
  () => formState.value.is_repeat,
  (newValue) => {
    if (newValue) {
      // Nếu bật lặp lại, tạo rrule mặc định
      formState.value.rrule = {
        freq: "DAILY",
        interval: 1,
        count: null,
        until: null,
        byweekday: [],
        bymonthday: [],
        bymonth: [],
      };
    } else {
      // Nếu tắt, xóa rrule
      formState.value.rrule = null;
    }
  },
  { immediate: true }
);

// Watch khi nhận dữ liệu từ props.event (backend hoặc FullCalendar)
// watch(
//   () => props.event,
//   (newEvent) => {
//     if (newEvent) {
//       eventData.value = {
//         ...newEvent,
//         start: newEvent.start ? dayjs(newEvent.start) : null // Chuyển đổi start sang dayjs
//       };
//     }
//   },
//   { deep: true, immediate: true }
// );



const repeatOptions = [
  { label: "Hàng ngày", value: "DAILY" },
  { label: "Hàng tuần", value: "WEEKLY" },
  { label: "Hàng tháng", value: "MONTHLY" },
  { label: "Hàng năm", value: "YEARLY" },
];

const weekDays = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const positionOptions = [
  { label: "Thứ đầu tiên", value: 1 },
  { label: "Thứ hai", value: 2 },
  { label: "Thứ ba", value: 3 },
  { label: "Thứ tư", value: 4 },
  { label: "Cuối cùng", value: -1 },
];

const handleSave = () => {
  console.log("🔹 Dữ liệu gốc trước khi xử lý:", JSON.parse(JSON.stringify(formState.value)));

  const apiData = {
    id: formState.value.id || undefined,
    title: formState.value.title || undefined,
    description: formState.value.description || undefined,
    location: formState.value.location || undefined,
    attendees: formState.value.attendees || undefined,
    start: formState.value.start ? dayjs(formState.value.start).toISOString() : undefined,
    end: formState.value.end ? dayjs(formState.value.end).toISOString() : undefined,
    allDay: formState.value.allDay,
    backgroundColor: formState.value.backgroundColor || "#00FF00",
    borderColor: formState.value.borderColor || "#00FF00",
    is_reminder: formState.value.is_reminder,
    reminder_time: formState.value.reminder_time ? formState.value.reminder_time : undefined,
    extendedProps: formState.value.extendedProps || {},
  };

  if (formState.value.is_repeat && formState.value.rrule) {
    console.log("🟡 Dữ liệu rrule trước khi xử lý:", JSON.parse(JSON.stringify(formState.value.rrule)));

    const rawRrule = {
      freq: formState.value.rrule.freq ?? "DAILY",
      interval: formState.value.rrule.interval ?? 1,
      count: formState.value.rrule.count ?? null,
      until: formState.value.rrule.until ? dayjs(formState.value.rrule.until).format("YYYY-MM-DD") : null,
      byweekday: formState.value.rrule.byweekday.length ? formState.value.rrule.byweekday : null,
      bymonthday: formState.value.rrule.bymonthday.length ? formState.value.rrule.bymonthday : null,
      bymonth: formState.value.rrule.bymonth.length ? formState.value.rrule.bymonth : null,
    };

    // Chỉ lọc các trường undefined, nhưng giữ lại null (nếu cần thiết)
    const filteredRrule = Object.fromEntries(
      Object.entries(rawRrule).filter(([_, v]) => v !== undefined)
    );

    apiData.rrule = Object.keys(filteredRrule).length > 0 ? filteredRrule : undefined;

    console.log("🟢 Dữ liệu rrule sau khi xử lý:", JSON.parse(JSON.stringify(apiData.rrule)));
  } else {
    apiData.rrule = undefined;
  }

  // Giữ nguyên rrule trong apiData nếu nó vẫn có giá trị
  const filteredApiData = Object.fromEntries(
    Object.entries(apiData).filter(([key, v]) => v !== undefined || key === "rrule")
  );

  console.log("✅ Dữ liệu gửi lên server:", JSON.parse(JSON.stringify(filteredApiData)));

  // Emit sự kiện để component cha xử lý việc gọi API
  emit("save", filteredApiData);
};



const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <Modal :visible="isAddEventModalVisible" title="Sự Kiện" @ok="handleSave" @cancel="emit('cancelAddEventModalVisible')"

    width="600px">
    <Form layout="vertical">
      <Form.Item label="Tiêu đề">
        <Input v-model:value="formState.title" placeholder="Nhập tiêu đề sự kiện" />
      </Form.Item>

      <Form.Item label="Mô tả">
        <Input.TextArea v-model:value="formState.description" placeholder="Nhập mô tả sự kiện" />
      </Form.Item>

      <Row :gutter="16">
        <Col span="12">
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker v-model:value="formState.start_time" show-time format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        </Col>
        <Col span="12">
        <Form.Item label="Thời gian kết thúc">
          <DatePicker v-model:value="formState.end_time" show-time format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col span="12">
        <Form.Item label="Cả ngày">
          <Switch v-model:checked="formState.is_all_day" />
        </Form.Item>
        </Col>
        <Col span="12">
        <Form.Item label="Nhắc nhở">
          <Switch v-model:checked="formState.is_reminder" />
          <template v-if="formState.is_reminder">
            <TimePicker v-model:value="formState.reminder_time" format="HH:mm" />
          </template>
        </Form.Item>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col span="12">
        <Form.Item label="Màu sắc">
          <Input v-model:value="formState.color_code" type="color" />
        </Form.Item>
        </Col>
        <Col span="12">
        <Form.Item label="Lặp lại">
          <Switch v-model:checked="formState.is_repeat" />
        </Form.Item>
        </Col>
      </Row>

      <template v-if="formState.is_repeat">
        <Card title="Cài đặt lặp lại" size="small">
          <Form.Item label="Kiểu lặp lại">
            <Select v-model:value="formState.rrule.freq" :options="repeatOptions" />
          </Form.Item>

          <Form.Item label="Khoảng cách lặp lại">
            <Input v-model:value="formState.rrule.interval" type="number" min="1" />
          </Form.Item>

          <Form.Item label="Giới hạn số lần lặp">
            <Input v-model:value="formState.rrule.count" type="number" min="1" />
          </Form.Item>

          <Form.Item label="Ngày trong tuần">
            <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" />
          </Form.Item>

          <Form.Item label="Ngày trong tháng">
            <Checkbox.Group v-model:value="formState.rrule.bymonthday" :options="monthDays" />
          </Form.Item>

          <Form.Item label="Tháng trong năm">
            <Checkbox.Group v-model:value="formState.rrule.bymonth" :options="months" />
          </Form.Item>

          <Form.Item label="Vị trí trong tháng">
            <Select v-model:value="formState.rrule.bysetpos" :options="positionOptions" />
          </Form.Item>

          <Form.Item label="Kết thúc vào">
            <DatePicker v-model:value="formState.rrule.until" format="YYYY-MM-DD" />
          </Form.Item>
        </Card>
      </template>
    </Form>
  </Modal>
</template>