<script setup>
import { defineProps, defineEmits, computed, ref, watch, h } from "vue";
import { Modal,
         Descriptions,
         Tag, 
         Button, 
         Space, 
         message, 
         Radio,
        } from "ant-design-vue";
import dayjs from "dayjs";
import axios from "axios";
import unknowUser from '@/assets/images/unknow_user.jpg';
import { CalendarOutlined, ClockCircleOutlined, CloseOutlined, DeleteOutlined, EditOutlined, MailOutlined, ShareAltOutlined, UsergroupAddOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  isEventDetailModalVisible: Boolean,
  event: Object,
});

const emit = defineEmits(["closeEventDetailModalVisible", "close", "editTask", "delete"]);
const isVisible = ref(props.isEventDetailModalVisible);
const event = ref({});
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const deleteOption = ref("");
const eventLink = ref('');

watch(() => props.isEventDetailModalVisible, (newVal) => {
  isVisible.value = newVal;
});

watch(
  () => props.event, (newVal) => {
    event.value = newVal;
    console.log(newVal);
  },
  { immediate: true, deep: true }
);

const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "Không xác định");

// Hàm xử lý xóa sự kiện
const deleteEvent = async ({code, date, id}) => {

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
  if (event.value.recurrence && event.value.recurrence != 'none') {
    
    Modal.confirm({
      title: "Xóa sự kiện lặp lại",
      width: 650,
      content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "deleteOption",
              value: "DEL_1",
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
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
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
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
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
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

// copy link
const copyToClipboard = () => {
  navigator.clipboard.writeText(`${window.location.origin}/calendar/event/${event.value.uuid}/invite`).then(() => {
    message.success('Đã sao chép liên kết!');
  });
};

// show modal link invite
const showModalLink = () => {
  Modal.info({
  title: 'Chia sẻ sự kiện',
  content: h('div', { style: { fontSize: '20px' } }, [
    h('p', { style: { fontWeight: 'bold' } }, 'Liên kết chia sẻ sự kiện:'),
    h('input', {
      value: `${window.location.origin}/calendar/event/${event.value.uuid}/invite`,
      readonly: true,
      style: { width: '100%', padding: '5px', fontSize: '16px', marginBottom: '10px' }
    }),
    h('button', { onClick: copyToClipboard, style: { padding: '5px 10px',color: 'white' ,cursor: 'pointer', backgroundColor: '#6479e3', border: 'none', borderRadius: '6px', fontSize: '14px' } }, 'Sao chép')
  ]),
  onOk() {},
});
}

// Đóng modal xác nhận xóa sự kiện lặp lại
const handleCancelDelete = () => {
  isDeleteConfirmVisible.value = false;
};

const handleClose = () => {
  isVisible.value = false;
  emit("close", false);
};

// 
const handleEditTask = () => {
  emit("editTask", props.event);  // Emit sự kiện với dữ liệu event
};
</script>

<template>
  <Modal
    v-model:open="isVisible"
    title="Chi Tiết Sự Kiện"
    width="700px"
    :footer="null"
    :closable="false" 
  >

      <!-- Header with action buttons -->
      <!-- <div class="flex items-center justify-between p-4 border-b">
        <div class="flex items-center space-x-2">
          <button class="bg-green-500 text-white px-3 py-1 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Yes
          </button>
          <button class="text-gray-700 px-3 py-1 rounded-md flex items-center">
            <span class="mr-1">?</span> Maybe
          </button>
          <button class="text-gray-700 px-3 py-1 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            No
          </button>
        </div>
      </div> -->
      
      <div class="flex items-center justify-end mr-2 space-x-3">
        <button class="text-gray-500" @click="handleEditTask">
          <EditOutlined />
        </button>
        <button class="text-gray-500" @click="handleDelete">
          <DeleteOutlined />
        </button>
        <button class="text-gray-500" @click="showModalLink">
          <ShareAltOutlined />
        </button>
        <button class="text-gray-500" @click="handleClose">
          <CloseOutlined />
        </button>
      </div>
      <!-- Event content -->
      <div class="p-4">
        <!-- Event title -->
        <div class="flex items-center mb-4">
          <div class="w-6 h-6 rounded-full mr-3" :style="{background: event.color}"></div>
          <h2 class="text-xl font-bold">{{ event.title }}</h2>
        </div>

        <!-- Date and time -->
        <div class="flex items-start mb-4">
          <div class="w-6 h-6 flex-shrink-0 mr-3">
            <ClockCircleOutlined class="text-xl text-gray-500" />
          </div>
          <div>
            <p class="text-gray-800">{{ event.start }}</p>
          </div>
        </div>

        <!-- Participants -->
        <div class="flex items-start mb-4" v-if="event.attendees && event.attendees.length > 0">
          <div class="w-6 h-6 flex-shrink-0 mr-3">
            <UsergroupAddOutlined class="text-xl text-gray-500" />
          </div>
          <div class="w-full">
            <div class="flex items-center justify-between mb-1">
              <p class="font-medium">3 Participants</p>
              <div class="flex space-x-2">
                <button class="text-gray-500">
                  <MailOutlined />
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">1 Yes, 2 Pending</p>

            <!-- Participant list -->
            <div class="space-y-3">
              <!-- Participant 1 -->
              <div class="flex items-center">
                <div class="relative mr-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Paula" class="w-8 h-8 rounded-full object-cover" />
                  <div class="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="font-medium">paula@zylker.com</p>
                  <p class="text-sm text-gray-600">Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="flex items-start mb-4">
          <div class="w-6 h-6 flex-shrink-0 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center">
              <p class="font-medium">Location</p>
            </div>
            <p class="text-sm text-gray-600">Ground Floor,Tower,Zylker Chennai</p>
          </div>
        </div>

        <!-- Meeting link -->
        <!-- <div class="flex items-start mb-4">
          <div class="w-6 h-6 flex-shrink-0 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="w-full">
            <div class="border rounded-md p-3 flex items-center justify-between">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span class="font-medium">Zoho Meeting</span>
              </div>
              <div class="flex items-center space-x-2">
                <button class="text-blue-600 text-sm">Copy link</button>
                <button class="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Start Meeting</button>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Calendar -->
        <div class="flex items-start">
          <div class="w-6 h-6 flex-shrink-0 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="font-medium">Paula Team Calendar</p>
            <p class="text-sm text-gray-600">My Calendar</p>
          </div>
        </div>
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
