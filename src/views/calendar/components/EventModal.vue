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
  visible: Boolean,
  event: Object,
});

const emit = defineEmits(["save", "cancel"]);

const formState = ref({
  title: "",
  description: "",
  start_time: null,
  end_time: null,
  is_all_day: false,
  is_reminder: false,
  reminder_time: null,
  color_code: "#00FF00",
  is_repeat: false,
  rrule: {
    freq: "DAILY",
    interval: 1,
    count: null,
    until: null,
    byweekday: [],
    bymonthday: [],
    bymonth: [],
    bysetpos: "",
  },
});

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      const rrule = newEvent.rrule || {};
      formState.value = {
        title: newEvent.title || "",
        description: newEvent.description || "",
        start_time: newEvent.start_time ? dayjs(newEvent.start_time) : null,
        end_time: newEvent.end_time ? dayjs(newEvent.end_time) : null,
        is_all_day: newEvent.is_all_day || false,
        is_reminder: newEvent.is_reminder || false,
        reminder_time: newEvent.reminder ? dayjs(newEvent.reminder) : null,
        color_code: newEvent.color_code || "#00FF00",
        is_repeat: newEvent.is_repeat || false,
        rrule: {
          freq: rrule.freq || "DAILY",
          interval: rrule.interval || 1,
          count: rrule.count || null,
          until: rrule.until ? dayjs(rrule.until) : null,
          byweekday: rrule.byweekday || [],
          bymonthday: rrule.bymonthday || [],
          bymonth: rrule.bymonth || [],
          bysetpos: rrule.bysetpos || "",
        },
      };
    }
  },
  { deep: true, immediate: true }
);

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
  const apiData = {
    title: formState.value.title || undefined,
    description: formState.value.description || undefined,
    start_time: formState.value.start_time ? formState.value.start_time.format('YYYY-MM-DD HH:mm:ss') : undefined,
    end_time: formState.value.end_time ? formState.value.end_time.format('YYYY-MM-DD HH:mm:ss') : undefined,
    is_all_day: formState.value.is_all_day,
    is_reminder: formState.value.is_reminder,
    reminder_time: formState.value.reminder_time ? formState.value.reminder_time.format('HH:mm') : undefined,
    color_code: formState.value.color_code || undefined,
    is_repeat: formState.value.is_repeat,
    rrule: {
      freq: formState.value.rrule.freq || "DAILY", // Đảm bảo có giá trị mặc định
      interval: formState.value.rrule.interval || 1,
      count: formState.value.rrule.count || undefined,
      until: formState.value.rrule.until ? formState.value.rrule.until.format('YYYY-MM-DD') : undefined,
      byweekday: formState.value.rrule.byweekday.length ? formState.value.rrule.byweekday : undefined,
      bymonthday: formState.value.rrule.bymonthday.length ? formState.value.rrule.bymonthday : undefined,
      bymonth: formState.value.rrule.bymonth.length ? formState.value.rrule.bymonth : undefined,
      bysetpos: formState.value.rrule.bysetpos || undefined,
    },
  
  };
  if(formState.value.is_repeat){
    apiData.rrule.until = formState.value.rrule.until ? formState.value.rrule.until.format('YYYY-MM-DD') : undefined;
  }

  const filteredApiData = Object.fromEntries(
    Object.entries(apiData).filter(([_, v]) => v !== undefined)
  );

  emit("save", filteredApiData);
  console.log("filteredApiData", filteredApiData);
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <Modal
    :visible="visible"
    title="Sự Kiện"
    @ok="handleSave"
    @cancel="handleCancel"
    width="600px"
  >
    <Form layout="vertical">
      <Form.Item label="Tiêu đề">
        <Input v-model:value="formState.title" placeholder="Nhập tiêu đề sự kiện" />
      </Form.Item>

      <Form.Item label="Mô tả">
        <Input.TextArea
          v-model:value="formState.description"
          placeholder="Nhập mô tả sự kiện"
        />
      </Form.Item>

      <Row gutter="16">
        <Col span="12">
          <Form.Item label="Thời gian bắt đầu">
            <DatePicker
              v-model:value="formState.start_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span="12">
          <Form.Item label="Thời gian kết thúc">
            <DatePicker
              v-model:value="formState.end_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter="16">
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

      <Row gutter="16">
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