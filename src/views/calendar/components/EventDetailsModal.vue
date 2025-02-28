<script setup>
import { defineProps, defineEmits, computed, ref, watch, h } from "vue";
import { Modal, Descriptions, Tag, Button, Space, message, Radio } from "ant-design-vue";
import dayjs from "dayjs";
import axios from "axios";
import unknowUser from '@/assets/images/unknow_user.jpg';

const props = defineProps({
  isEventDetailModalVisible: Boolean,
  event: Object,
});

const emit = defineEmits(["closeEventDetailModalVisible", "edit", "delete"]);
const isVisible = ref(props.isEventDetailModalVisible);
const event = ref({});
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const deleteOption = ref("");

watch(() => props.isEventDetailModalVisible, (newVal) => {
  isVisible.value = newVal;
});

watch(
  () => props.event, (newVal) => {
    event.value = newVal;
    console.log("Event nhận được:", event.value);
  },
  { immediate: true, deep: true }
);

const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "Không xác định");

// Hàm xử lý xóa sự kiện
const deleteEvent = async ({code, date, id}) => {
  console.log("Xóa sự kiện:", { code, date, id });

  try {
    const response = await axios.delete(`${dirApi}tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { code, date }
      }
    );

    if(response.data.code == 401) {
      message.warning(response.data.message);
    }

    if(response.data.code == 200) {
      message.success(response.data.message || 'Success');
      emit("delete", id);
      handleClose();
    }
    // console.log(response.data);
  } catch (error) {
    message.error('An error occurred');
  }
}

// Xử lý xóa sự kiện
const handleDelete = () => {
  console.log(event.value);
  if (event.value.recurrence && event.value.recurrence != 'none') {
    
    Modal.confirm({
      title: "Xóa sự kiện lặp lại",
      content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "deleteOption",
              value: "DEL_1",
              class: "form-radio text-blue-600 cursor-pointer",
              onInput: (e) => {
                deleteOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, "Chỉ xóa sự kiện này"),
          ]),
        ]),
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "deleteOption",
              value: "DEL_1B",
              class: "form-radio text-blue-600 cursor-pointer",
              onInput: (e) => {
                deleteOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, "Xóa sự kiện này và những sự kiện tiếp theo"),
          ]),
        ]),
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "deleteOption",
              value: "DEL_A",
              class: "form-radio text-blue-600 cursor-pointer",
              onInput: (e) => {
                deleteOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, "Xóa tất cả sự kiện"),
          ]),
        ]),
      ]),
      okText: "Xóa",
      cancelText: "Hủy",
      onOk() {
        deleteEvent({ code: deleteOption.value, date: event.value.start, id: event.value.id });
      },
    });

  } else {
   deleteEvent({code: "DEL_N", date: event.value.start, id: event.value.id });
  }
}

// Xử lý xóa sự kiện lặp lại
// const handleDeleteConfirm = () => {
//   switch (deleteOption.value) {
//     case "DEL_1":
//       deleteEvent({ code: "DEL_1", date: event.value.start, id: event.value.id });
//       message.success("Sự kiện đã được xóa");
//       break;
//     case "DEL_A":
//       deleteEvent({ code: "DEL_A", date: event.value.start, id: event.value.id });
//       message.success("Tất cả các sự kiện đã được xóa");
//       break;
//     case "DEL_1B":
//       deleteEvent({ code: "DEL_1B", date: event.value.start, id: event.value.id });
//       message.success("Sự kiện này và các sự kiện tiếp sau đã được xóa");
//       break;
//     default:
//       break;
//   }
//   isDeleteConfirmVisible.value = false;
//   handleClose();
// };

// Đóng modal xác nhận xóa sự kiện lặp lại
const handleCancelDelete = () => {
  isDeleteConfirmVisible.value = false;
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
    width="900px"
    :footer="null"
  >
    <Descriptions bordered :column="1">
      <Descriptions.Item label="Tiêu đề">
        <span class="text-lg">{{ event?.title || "Không có tiêu đề" }}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Mô tả">
        <span class="text-lg">{{ event?.description || "Không có mô tả" }}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Địa điểm">
        <span class="text-lg">{{ event?.location || "Không có địa điểm" }}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Người tham gia">
        <template v-if="event?.attendees?.length">
          <template v-for="(attendee, index) in event.attendees" :key="index">
            <div class="flex align-center mb-2">
              <img :src="attendee.avatar ?? unknowUser" alt="" class="w-8 h-8 rounded-full mr-2" />
              <span class="text-sm flex flex-col justify-center">{{ attendee.first_name }} {{ attendee.last_name }}</span>
            </div>
          </template>
        </template>
        <template v-else><span class="text-lg">Không có người tham gia</span></template>
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian bắt đầu">
        <span class="text-lg">{{ formatDate(event?.start) }}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian kết thúc">
        <span class="text-lg">
          {{ formatDate(event?.end) }}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái sự kiện">
        <Tag color="green">
          <span>
            {{ event.is_all_day ? 'Cả ngày': 'Cụ thể' }}
          </span>
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Nhắc nhở">
        <template v-if="event?.is_reminder">
          <Tag v-for="(time, index) in event.reminder" :key="index" color="blue">
            Trước {{ time.set_time >= 60 ? time.set_time / 60 : time.set_time }} {{ time.set_time >= 60 ? 'giờ' : 'phút' }} - {{ time.type }}
          </Tag>
        </template>
        <template v-else>Không</template>
      </Descriptions.Item>
      <Descriptions.Item label="Màu sắc">
        <div :style="{ backgroundColor: event?.color, width: '30px', height: '30px', borderRadius: '50%' }"></div>
      </Descriptions.Item>
      <Descriptions.Item label="Lặp lại">
        <template v-if="event?.recurrence != 'none'">
         <span class="text-lg">Có</span>
        </template>
        <template v-else>Không</template>
      </Descriptions.Item>
    </Descriptions>
    
    <div class="modal-footer">
      <Space>
        <Button type="primary" @click="emit('edit', event.id)">Sửa</Button>
        <Button type="danger" class="bg-red-500 text-white" @click="handleDelete">Xóa</Button>
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
