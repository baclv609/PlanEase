<template>
  <a-modal
    :open="isVisible"
    title="Thêm / Chỉnh sửa Sự Kiện"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <a-form-item label="Tiêu đề sự kiện">
        <a-input v-model:value="eventData.title" placeholder="Nhập tiêu đề" />
      </a-form-item>

      <a-form-item label="Thời gian">
        <a-date-picker
          v-model:value="eventData.start"
          show-time
          format="YYYY-MM-DD HH:mm"
          :value-format="'YYYY-MM-DD HH:mm:ss'"
        />
      </a-form-item>

      <a-form-item label="Màu sắc">
        <a-input type="color" v-model:value="eventData.color" />
      </a-form-item>

      <a-form-item label="Lặp lại sự kiện">
        <a-select v-model:value="eventData.recurrence">
          <a-select-option value="none">Không lặp lại</a-select-option>
          <a-select-option value="daily">Hàng ngày</a-select-option>
          <a-select-option value="weekly">Hàng tuần</a-select-option>
          <a-select-option value="monthly">Hàng tháng</a-select-option>
          <a-select-option value="yearly">Hàng năm</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="eventData.recurrence !== 'none'" label="Số lần lặp lại">
        <a-input-number v-model:value="eventData.repeatCount" :min="1" />
      </a-form-item>

      <a-form-item label="Ghi chú">
        <a-textarea
          v-model:value="eventData.description"
          placeholder="Mô tả sự kiện..."
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  visible: Boolean, // Định nghĩa prop visible
  event: Object,
});

const emit = defineEmits(["update:visible", "save"]);

// const isVisible = computed({
//   get: () => props.visible,
//   set: (value) => emit("update:visible", value),
// });
const isVisible = ref(props.visible);
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal;
  }
);

const eventData = ref({
  title: "",
  start: "",
  color: "#3788d8",
  recurrence: "none",
  repeatCount: 1,
  description: "",
});

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      eventData.value = { 
        ...newEvent, 
        start: newEvent.start ? dayjs(newEvent.start) : null // Chuyển đổi start sang dayjs
      };
    }
  },
  { deep: true, immediate: true }
);


const handleOk = () => {
  emit("save", {
    ...eventData.value,
    start: eventData.value.start
      ? eventData.value.start.format("YYYY-MM-DDTHH:mm:ss")
      : null,
  });
  emit("update:visible", false);
};

const handleCancel = () => {
  emit("update:visible", false);
};
</script>
