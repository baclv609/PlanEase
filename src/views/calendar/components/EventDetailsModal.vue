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
import imgInvite from '@/assets/images/attendee-removebg-preview.png';

import { AlignLeftOutlined,
         BellOutlined, 
         CalendarOutlined, 
         CheckOutlined, 
         ClockCircleOutlined, 
         CloseOutlined, 
         CopyOutlined, 
         DeleteOutlined,
         EditOutlined, 
         EnvironmentOutlined, 
         MailOutlined, 
         QuestionOutlined, 
         SendOutlined, 
         ShareAltOutlined, 
         UsergroupAddOutlined 
        } from "@ant-design/icons-vue";


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
const userId = ref(JSON.parse(localStorage.getItem('user')).id);
const activeTab = ref("infoEvent");

const messages = ref([
  {
    userId: '1',
    text: 'Hello everyone! How are you doing today?',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    userId: '2',
    text: 'Hi Alice! I\'m doing great, thanks for asking.',
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    userId: '6',
    text: 'Hello! Just joined the chat. What are we talking about?',
    timestamp: new Date(Date.now() - 3400000).toISOString()
  },
  {
    userId: '1',
    text: 'We\'re just getting started. Feel free to introduce yourself!',
    timestamp: new Date(Date.now() - 3300000).toISOString()
  },
  {
    userId: '2',
    text: 'Hi Alice! I\'m doing great, thanks for asking.',
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    userId: '6',
    text: 'Hello! Just joined the chat. What are we talking about?',
    timestamp: new Date(Date.now() - 3400000).toISOString()
  },
  {
    userId: '1',
    text: 'We\'re just getting started. Feel free to introduce yourself!',
    timestamp: new Date(Date.now() - 3300000).toISOString()
  }
]);
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const newMessage = ref('');
const messagesContainer = ref(null);

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
      width: 500,
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
  Modal.destroyAll();
};

// show modal link invite
const showModalLink = () => {
  Modal.info({
    icon: null,
    width: 450,
    maskClosable: true,
    centered: true,
    title: h("div", { class: "flex justify-between items-center" }, 
          h("span", { class: "text-lg font-semibold" }, "Mời qua đường liên kết")),
    content: h("div", { class: "space-y-4" }, [
      h("p", { class: "text-gray-600 text-sm" }, "Hãy chia sẻ đường liên kết này với người khác. Họ sẽ có thể xem sự kiện và phản hồi."),

      // Ô chứa link + nút sao chép trên cùng hàng
      h("div", { class: "flex items-center bg-gray-50 p-2 rounded-md text-sm" }, [
        h(
          "a",
          {
            href: `${window.location.origin}/calendar/event/${event.value.uuid}/invite`,
            target: "_blank",
            class: "text-blue-600 truncate flex-1",
            style: "display: block; max-width: 100%;",
          },
          `${window.location.origin}/calendar/event/${event.value.uuid}/invite`
        ),
        h("div", { class: "shrink-0" }, [
          h(
            "button",
            {
              onClick: copyToClipboard,
              class: "flex items-center justify-center min-w-fit border-none bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700 transition whitespace-nowrap",
            },
            [h(CopyOutlined, { class: "mr-1 text-lg cursor-pointer" })]
          ),
        ]),
      ]),
    ]),
    footer: null,
  });
}

// Đóng modal xác nhận xóa sự kiện lặp lại
const handleCancelDelete = () => {
  isDeleteConfirmVisible.value = false;
};

const handleClose = () => {
  isVisible.value = false;
  activeTab.value = 'infoEvent';
  emit("close", false);
};

// 
const handleEditTask = () => {
  emit("editTask", props.event);  // Emit sự kiện với dữ liệu event
};

// Format định dạng ngày
const formatDateTime = (isoString) => {
  return dayjs(isoString).locale(JSON.parse(localStorage.getItem('userSettings')).language).format("dddd, [ngày] D [tháng] M [năm] YYYY, HH:mm");
};

const accept = async (uuid) => {
    try {
      const response = await axios.post(`${dirApi}event/${uuid}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if(response.data.code == 400) {
        message.info(response.data.message || 'Can not invite yourself');
      }

      if(response.data.code == 409) {
        message.info(response.data.message || 'You have already accepted this event');
      }

      if(response.data.code == 200) {
        message.info(response.data.message);
      }

    } catch(error) {
      console.log(error);
    }
}

const refuse = async (uuid) => {
  try {
    const response = await axios.post(`${dirApi}event/${uuid}/refuse`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if(response.data.code == 404) {
      message.info(response.data.message || 'Event not found');
    }

    if(response.data.code == 200) {
      message.info(response.data.message)
    }

  } catch(error) {
    console.log(error);
  }
}
</script>

<template>
  <Modal v-model:open="isVisible" width="650px" :footer="null" :closable="false">

    <div class="flex items-center justify-end mr-2 space-x-3">
      <button
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="handleEditTask">
        <EditOutlined class="text-xl" />
      </button>
      <button
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="handleDelete">
        <DeleteOutlined class="text-xl" />
      </button>
      <button
        v-if="event.user_id == userId || (event.attendees && event.attendees.some(attendee => attendee.user_id == userId && attendee.role == 'edit'))"
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="showModalLink">
        <ShareAltOutlined class="text-xl" />
      </button>
      <button
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="handleClose">
        <CloseOutlined class="text-xl" />
      </button>
    </div>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="infoEvent" tab="Thông tin chung">
        <!-- Event content -->
        <div class="px-4">
          <!-- Event title -->
          <div class="flex items-center mb-4">
            <div class="w-6 h-6 rounded-full mr-3" :style="{background: event.color}"></div>
            <h2 class="text-xl font-bold  mb-0">{{ event.title }}</h2>
          </div>

          <!-- Date and time -->
          <div class="flex items-start mb-4">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <ClockCircleOutlined class="text-xl text-gray-500" />
            </div>
            <div>
              <p class="text-gray-800 mb-0">{{ formatDateTime(event.start) }} {{ event.end ? formatDateTime(event.end) :
                ''}}, {{ event.timezone }}</p>
              <p class="text-gray-800" v-if="event.recurrence && event.recurrence != 'none'">
                <span v-if="event.info.extendedProps.freq === 'daily'">Hàng ngày</span>
                <span v-else-if="event.info.extendedProps.freq === 'weekly'">Hàng tuần</span>
                <span v-else-if="event.info.extendedProps.freq === 'monthly'">Hàng tháng</span>
                <span v-else-if="event.info.extendedProps.freq === 'yearly'">Hàng năm</span>
              </p>
            </div>
          </div>

          <div class="flex items-start mb-4" v-if="event.description">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <AlignLeftOutlined class="text-xl text-gray-500" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">Mô tả</p>
              </div>
                <p class="text-gray-800" v-html="event.description"></p>
            </div>
          </div>

          <!-- Participants -->
          <div class="flex items-start mb-4" v-if="event.attendees && event.attendees.length > 0">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <UsergroupAddOutlined class="text-xl text-gray-500" />
            </div>
            <div class="w-full">
              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <p class="font-medium">{{ event.attendees.length }} Người tham gia |</p>
                  <p class="text-xs mt-1 text-gray-600">
                    <span>{{ event.attendees.filter(attendee => attendee.status === 'yes').length }} Đồng ý
                      {{ event.attendees.filter(attendee => attendee.status === 'pending').length > 0 ?
                      `,${event.attendees.filter(attendee => attendee.status === 'pending').length} Đang chờ` : '' }}
                    </span>
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="text-gray-800 bg-transparent border-none hover:bg-gray-100 rounded-full transition px-3 py-2 cursor-pointer">
                    <MailOutlined class="text-xl py-1" />
                  </button>
                </div>
              </div>

              <!-- Participant list -->
              <div class="space-y-1">
                <!-- Participant 1 -->
                <div class="flex items-center" v-for="attendee in event.attendees" :key="attendee.user_id">
                  <div class="relative mr-3">
                    <img :src="attendee.avatar || unknowUser" alt="Paula" class="w-8 h-8 rounded-full object-cover" />
                    <div v-if="attendee.status === 'yes'"
                      class="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full flex items-center justify-center">
                      <CheckOutlined class="w-3 h-3 text-white" />
                    </div>
                    <div v-else-if="attendee.status === 'pending'"
                      class="absolute -bottom-1 -right-1 bg-yellow-500 w-4 h-4 rounded-full flex items-center justify-center">
                      <QuestionOutlined class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p class="-mb-[0.5px] text-md">{{ attendee.email }}</p>
                    <p class="text-xs mb-0 text-gray-600">{{ attendee.first_name }} {{ attendee.last_name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-start mb-4" v-if="event.location">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <EnvironmentOutlined class="h-6 w-6 text-gray-500 text-xl" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">Địa điểm</p>
              </div>
              <p class="text-sm text-gray-600">{{ event.location || 'Không có' }}</p>
            </div>
          </div>

          <!-- Reminder -->
          <div class="flex items-start mb-4" v-if="event.is_reminder">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <BellOutlined class="h-6 w-6 text-gray-500 text-xl" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">Nhắc nhở</p>
              </div>

              <p class="text-sm text-gray-600 mb-0" v-for="(time, index) in event.reminder" :key="index">
                Trước {{ time.set_time >= 60 ? time.set_time / 60 : time.set_time }} {{ time.set_time >= 60 ? 'giờ' :
                'phút' }} - {{ time.type }}
              </p>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="font-medium mb-0">Lịch</p>
              <p class="text-sm text-gray-600">My Calendar</p>
            </div>
          </div>
        </div>

        <div
          v-if="event.attendees && event.attendees.some(attendee => attendee.user_id == userId && attendee.status == 'yes')"
          class="flex justify-center">
          <p class="text-green-500 mb-0">Bạn đã tham gia sự kiện này</p>
        </div>
        <div
          v-else-if="event.attendees && event.attendees.some(attendee => attendee.user_id == userId && attendee.status == 'pending')"
          class="flex justify-center">
          <p class="text-yellow-500 mb-0">Bạn có muốn tham gia vào sự kiện này không</p>
        </div>
        <div v-if="event.attendees && event.attendees.length > 0 && userId != event.user_id"
          class="flex justify-center p-4">
          <div class="flex items-center space-x-2">
            <button @click="accept(event.uuid)"
              class="px-3 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100 font-semibold hover:text-blue-500 transition flex items-center ">
              <CheckOutlined class="mr-1" />
              Có
            </button>
            <button @click="refuse(event.uuid)"
              class="px-3 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100 font-semibold hover:text-blue-500 transition flex items-center">
              <CloseOutlined class="mr-1" />
              Không
            </button>
          </div>
        </div>

      </a-tab-pane>

      <a-tab-pane v-if="event.type == 'event' && event.attendees.length > 0" key="discuss" tab="Thảo luận">
        <div class="flex h-screen bg-gray-100">
          <!-- Main chat area -->
          <div class="flex-1 flex flex-col">
            
            <!-- Messages area -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
              <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
                <div class="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
              <div v-for="(message, index) in messages" :key="index" :class="[
                'flex',
                message.userId == 6 ? 'justify-end' : 'justify-start'
              ]">
                <div :class="[
                  'max-w-xs md:max-w-md rounded-lg px-4 py-2 break-words',
                  message.userId === 6
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                ]">
                  <div v-if="message.userId !== 6" class="font-medium text-xs mb-1"
                    :style="{color: '#CCCCC'}">
                    {{ "Unknow" }}
                  </div>
                  <p>{{ message.text }}</p>
                  <div :class="[
                    'text-xs mt-1 text-right',
                    message.userId == 6 ? 'text-blue-100' : 'text-gray-500'
                  ]">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Input area -->
            <div class="bg-white border-t py-2 border-gray-200">
              <form @submit.prevent="sendMessage" class="flex space-x-2 w-full">
                <div class="flex-1 w-11/12">
                  <input v-model="newMessage"
                    class="flex-1 border w-full px-2 border-gray-400 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..." />
                </div>
                <div class="w-1/12">
                  <button type="submit"
                    class="bg-blue-500 text-white w-full h-full rounded-lg border-none cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :disabled="!newMessage.trim()">
                    <SendOutlined />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </Modal>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
