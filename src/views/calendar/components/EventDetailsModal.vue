<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import { Modal, Descriptions, Tag, Button, Space, message } from "ant-design-vue";
import dayjs from "dayjs";

const props = defineProps({
  isEventDetailModalVisible: Boolean,
  event: Object,
});

const emit = defineEmits(["closeEventDetailModalVisible", "edit", "delete"]);
const isVisible = ref(props.isEventDetailModalVisible);

watch(() => props.isEventDetailModalVisible, (newVal) => {
  isVisible.value = newVal;
});

const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "Không xác định");

const eventStatus = computed(() => {
  return props.event?.allDay ? "Cả ngày" : "Cụ thể";
});

const handleDelete = () => {
  message.success("Sự kiện đã được xóa");
  emit("delete", props.event.id);
  handleClose();
};

const handleClose = () => {
  isVisible.value = false;
  emit("closeEventDetailModalVisible", false);
};
</script>

<template>
  <Modal
    v-model:visible="isVisible"
    title="Chi Tiết Sự Kiện"
    @cancel="handleClose"
    width="600px"
    :footer="null"
  >
    <Descriptions bordered :column="1">
      <Descriptions.Item label="Tiêu đề">
        {{ event?.title || "Không có tiêu đề" }}
      </Descriptions.Item>
      <Descriptions.Item label="Mô tả">
        {{ event?.description || "Không có mô tả" }}
      </Descriptions.Item>
      <Descriptions.Item label="Địa điểm">
        {{ event?.location || "Không có địa điểm" }}
      </Descriptions.Item>
      <Descriptions.Item label="Người tham gia">
        <template v-if="event?.attendees?.length">
          <Tag v-for="(attendee, index) in event.attendees" :key="index" color="blue">
            {{ attendee }}
          </Tag>
        </template>
        <template v-else>Không có người tham gia</template>
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian bắt đầu">
        {{ formatDate(event?.start) }}
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian kết thúc">
        {{ formatDate(event?.end) }}
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái sự kiện">
        <Tag color="green">{{ eventStatus }}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Nhắc nhở">
        <template v-if="event?.is_reminder">
          Có - {{ event.reminder_time }} trước sự kiện
        </template>
        <template v-else>Không</template>
      </Descriptions.Item>
      <Descriptions.Item label="Màu sắc">
        <div :style="{ backgroundColor: event?.backgroundColor, width: '30px', height: '30px', borderRadius: '50%' }"></div>
      </Descriptions.Item>
      <Descriptions.Item label="Lặp lại">
        <template v-if="event?.is_repeat">Có</template>
        <template v-else>Không</template>
      </Descriptions.Item>
    </Descriptions>
    
    <div class="modal-footer">
      <Space>
        <Button type="primary" @click="emit('edit', event.id)">Sửa</Button>
        <Button type="danger" @click="handleDelete">Xóa</Button>
        <Button @click="handleClose">Đóng</Button>
      </Space>
    </div>
  </Modal>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
