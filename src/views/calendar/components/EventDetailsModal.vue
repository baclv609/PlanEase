<script setup>
import { defineProps, defineEmits, computed, ref, watch, h, onMounted, onUnmounted, nextTick } from "vue";
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
         CommentOutlined, 
         CopyOutlined, 
         DeleteOutlined,
         EditOutlined, 
         EnvironmentOutlined, 
         FileProtectOutlined, 
         FrownOutlined, 
         GlobalOutlined, 
         HistoryOutlined, 
         MailOutlined, 
         QuestionOutlined, 
         SendOutlined, 
         ShareAltOutlined, 
         UsergroupAddOutlined,
         FileOutlined, 
         FileWordOutlined, 
         FileExcelOutlined, 
         FilePptOutlined, 
         FileTextOutlined,
         DownloadOutlined 
        } from "@ant-design/icons-vue";

import { useEchoStore } from "@/stores/echoStore";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { attachTypeApi } from "ant-design-vue/es/message";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import { useI18n } from 'vue-i18n';

import { useSettingsStore } from '@/stores/settingsStore';

const { t } = useI18n();

const settingsStore = useSettingsStore();

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const settingTimezone = computed(() => settingsStore.timeZone);
const userTimezone = computed(() => settingTimezone.value);

const props = defineProps({
  isEventDetailModalVisible: Boolean,
  event: Object,
});

const emit = defineEmits(["closeEventDetailModalVisible", "close", "editTask", "delete"]);
const isVisible = ref(props.isEventDetailModalVisible);
const event = ref({});
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const deleteOption = ref("DEL_1");
const leaveOption = ref("EDIT_1");
const eventLink = ref('');
const user = ref(JSON.parse(localStorage.getItem('user')));
const activeTab = ref("infoEvent");
const loadingGetFiles = ref(false);
const replyingTo = ref(null);
const echoStore = useEchoStore();

const messages = ref([]);

const files = ref([]);

const transformMessages = (messages) => {
  return messages.map(msg => ({
    messageId: msg.id,
    userId: msg.user_id,
    name: `${msg.user.first_name} ${msg.user.last_name}`,
    text: msg.message,
    avatar: msg.user.avatar,
    replyTo: msg.reply_to ? {
      user_id: msg.reply_message.user.id,
      text: msg.reply_message.message,
      name: `${msg.reply_message.user.first_name} ${msg.reply_message.user.last_name}`,
    } : null,
    timestamp: msg.created_at,
  }));
};

// format thời gian tin nhắn
const formatTime = (timestamp) => {
  const time = dayjs.utc(timestamp).tz(userTimezone.value);
  const now = dayjs().tz(userTimezone.value);

  if (time.isSame(now, "day")) {
    return time.format("HH:mm");
  } else {
    return time.format("DD/MM/YYYY");
  }
};
const newMessage = ref('');
const messagesContainer = ref(null);
const groupInfo = ref({});

watch(() => props.isEventDetailModalVisible, (newVal) => {
  isVisible.value = newVal;
});

watch(
  () => props.event, async (newVal) => {
    event.value = newVal;
    // console.log(event.value);
    if(props.event != null && newVal && newVal.attendees?.length > 0){
      const currentUserAttendee = newVal.attendees.find(attendee => attendee.user_id == user.value.id);

      if((currentUserAttendee && currentUserAttendee.status == "yes") || user.value.id == newVal.user_id){
        const data = await getMessagesByGroup(newVal.parent_id ? newVal.parent_id : newVal.id);

        groupInfo.value = data;
        messages.value = transformMessages(groupInfo.value.messages);

        echoStore.echo.private(`task-group.${groupInfo.value.group.id}`)
        .listen(`Chat\\NewTaskGroupChatMessages`, (message) => {   
          
          const formattedMessage = {
              messageId: message.id,
              userId: message.user_id,
              name: `${message.user.first_name} ${message.user.last_name}`,
              text: message.message,
              avatar: message.user.avatar,
              replyTo: message.reply_message
                  ? {
                      userId: message.reply_message.user.id,
                      text: message.reply_message.message,
                      name: `${message.reply_message.user.first_name} ${message.reply_message.user.last_name}`,
                  }
                  : null, // Nếu không có reply thì null
              timestamp: message.created_at,
          };

          messages.value.push(formattedMessage);
        });
      }
    }
  },
  { immediate: true, deep: true }
);

const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "Không xác định");

// Hàm xử lý xóa sự kiện
const deleteEvent = async ({code, date, id, sendMail}) => {

  try {
    const response = await axios.delete(`${dirApi}tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { code, date , id, sendMail}
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
  const hasGuests = event.value.attendees && event.value.attendees.length > 0;

  const confirmNotifyGuests = (deleteData) => {
  if (!hasGuests) {
    deleteEvent(deleteData);
    return;
  }

  Modal.confirm({
    title: t('eventModal.messages.sendEmail.title'),
    content: t('eventModal.messages.sendEmail.content'),
    centered: true,
    width: 600,
    okButtonProps: { style: { display: 'none' } },
    cancelButtonProps: { style: { display: 'none' } },
    footer: () =>
      h("div", { class: "w-full flex justify-end space-x-4 p-4" }, [
        // Nút "Quay lại"
        h(
          "button",
          {
            class: "text-gray-500 hover:text-gray-700 border-0 px-4 py-2 cursor-pointer font-semibold rounded-lg transition duration-200 text-sm",
            onClick: () => {
              Modal.destroyAll(); // Huỷ xoá
            },
          },
          t('eventModal.messages.sendEmail.back')
        ),

        // Nút "Không gửi"
        h(
          "button",
          {
            class: "text-red-500 hover:text-red-700 border-0 rounded-lg px-4 py-2 cursor-pointer font-semibold transition duration-200 text-sm",
            onClick: () => {
              Modal.destroyAll();
              deleteEvent({ ...deleteData, sendMail: 'no' });
            },
          },
          t('eventModal.messages.sendEmail.dontSend')
        ),

        // Nút "Gửi"
        h(
          "button",
          {
            class: "text-blue-500 hover:text-blue-700 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer font-semibold border-0 transition duration-200 text-sm",
            onClick: () => {
              Modal.destroyAll();
              deleteEvent({ ...deleteData, sendMail: 'yes' });
            },
          },
          t('eventModal.messages.sendEmail.send')
        ),
      ]),
    });
  };

  if (event.value.recurrence && event.value.recurrence != 0) {
    
    Modal.confirm({
      title: t('options.recurrence.delete.title'),
      width: 500,
      centered: true,
      content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "deleteOption",
              value: "DEL_1",
              checked: deleteOption.value == "DEL_1",
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
              onInput: (e) => {
                deleteOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, t('options.recurrence.delete.one')),
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
            h("span", { class: "text-lg" }, t('options.recurrence.delete.follow')),
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
            h("span", { class: "text-lg" }, t('options.recurrence.delete.all')),
          ]),
        ]),
      ]),
      okText: t('options.recurrence.delete.delete'),
      cancelText: t('options.recurrence.delete.cancel'),
      onOk() {
        deleteEvent({ code: deleteOption.value, date: event.value.start, id: event.value.id });
      },
    });

  } else {
    Modal.confirm({
      title: t('options.recurrence.delete.confirm'),
      content: t('options.recurrence.delete.confirm_content'),
      okText: t('options.recurrence.delete.delete'),
      cancelText: t('options.recurrence.delete.cancel'),
      centered: true,
      onOk() {
        const deleteData = {
          code: "DEL_N",
          date: event.value.start,
          id: event.value.id,
        };
        confirmNotifyGuests(deleteData);
      },
    });
    // Modal.confirm({
    //   title: t('options.recurrence.delete.confirm'),
    //   content: t('options.recurrence.delete.confirm_content'),
    //   okText: t('options.recurrence.delete.delete'),
    //   cancelText: t('options.recurrence.delete.cancel'),
    //   centered: true,
    //   onOk() {
    //     deleteEvent({code: "DEL_N", date: event.value.start, id: event.value.id });
    //   },
    // });
  }
}

// copy link
const copyToClipboard = () => {
  navigator.clipboard.writeText(`${window.location.origin}/calendar/event/${event.value.uuid}/invite`).then(() => {
    message.success(t('share.link.copySuccess'));
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
          h("span", { class: "text-lg font-semibold" }, t('share.link.title')),
    ),
    content: h("div", { class: "space-y-4" }, [
      h("p", { class: "text-gray-600 text-sm" }, t('share.link.content')),

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
  deleteOption.value = "DEL_1";
  leaveOption.value = "EDIT_1";
  if (groupInfo.value.group && groupInfo.value.group.id){
    console.log("Dừng lắng nghe realtime trong Chat ModalDetails", groupInfo.value.group.id);
    echoStore.echo.leave(`task-group.${groupInfo.value.group.id}`);
    groupInfo.value = {};
  }
    files.value = [];
  emit("close", false);
};

// 
const handleEditTask = () => {
  emit("editTask", props.event);  // Emit sự kiện với dữ liệu event
};

// Format định dạng ngày
const formatDateTime = (isoString, timezone) => {
  return dayjs(isoString)
        .tz(timezone)
        .locale(JSON.parse(localStorage.getItem('userSettings')).language)
        .format("dddd, D/M/YYYY");
};

const formatTimeInfo = (isoString, timezone) => {
  return dayjs(isoString)
        .tz(timezone)
        .locale(JSON.parse(localStorage.getItem('userSettings')).language)
        .format("HH:mm");
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
        message.success(t('EventDetailsModal.general.accept'));
        emit("delete");
        emit("close", false);
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
      message.info(t('EventDetailsModal.general.refuse'));
      emit("delete");
      emit("close", false);
    }

  } catch(error) {
    console.log(error);
  }
}

const leaveEvent = async (uuid) => {
  if ((event.value.recurrence && event.value.recurrence != 0) || event.value.parent_id) {
    
    Modal.confirm({
      title: t('options.recurrence.participants.leave.title'),
      width: 600,
      content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "leaveOption",
              value: "EDIT_1",
              checked: leaveOption.value == "EDIT_1",
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
              onInput: (e) => {
                leaveOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, t('options.recurrence.participants.leave.one')),
          ]),
        ]),
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "leaveOption",
              value: "EDIT_1B",
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
              onInput: (e) => {
                leaveOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, t('options.recurrence.participants.leave.follow')),
          ]),
        ]),
        h("div", { class: "mb-3" }, [
          h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
            h("input", {
              type: "radio",
              name: "leaveOption",
              value: "EDIT_A",
              class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
              onInput: (e) => {
                leaveOption.value = e.target.value;
              },
            }),
            h("span", { class: "text-lg" }, t('options.recurrence.participants.leave.all')),
          ]),
        ]),
      ]),
      okText: t('options.recurrence.participants.leave.delete'),
      cancelText: t('options.recurrence.participants.leave.cancel'),
      onOk() {
        Modal.confirm({
          title: t('options.recurrence.participants.leave.confirm'),
          content: t('options.recurrence.participants.leave.confirm_content'),
          okText: t('options.recurrence.participants.leave.delete'),
          cancelText: t('options.recurrence.participants.leave.cancel'),
          centered: true,
          onOk() {
            handleLeaveEvent({code: leaveOption.value, id: event.value.id, start_time: event.value.start, end_time: event.value.end, date: event.value.start, timezone: event.value.timezone});
          },
        });
      },
    });

  } else {
    Modal.confirm({
      title: t('options.recurrence.participants.leave.confirm'),
      content: t('options.recurrence.participants.leave.confirm_content'),
      okText: t('options.recurrence.participants.leave.delete'),
      cancelText: t('options.recurrence.participants.leave.cancel'),
      centered: true,
      onOk() {
        handleLeaveEvent({code: "EDIT_N", id: event.value.id, start_time: event.value.start, end_time: event.value.end, date: event.value.start, timezone: event.value.timezone});
      },
    });
  }
}

const handleLeaveEvent = async ({code, id, start_time, end_time, date, timezone}) => {
  try {
    let formattedDate;
    
    // Nếu múi giờ sự kiện khác với múi giờ setting
    if (timezone != userTimezone.value) {
      const eventDate = dayjs(date).tz(timezone); // Convert về đúng timezone sự kiện
      formattedDate = event.value.is_all_day 
        ? eventDate.format("YYYY-MM-DD 00:00:00")
        : eventDate.format("YYYY-MM-DD HH:mm:ss");
    } else {
      formattedDate = event.value.is_all_day 
        ? dayjs(date).format("YYYY-MM-DD 00:00:00")
        : dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    }
    
    console.log(
      {
        code: code,
        updated_date: formattedDate,
        start_time: event.value.is_all_day 
          ? dayjs(start_time).tz(timezone).format("YYYY-MM-DD 00:00:00")
          : dayjs(start_time).tz(timezone).format("YYYY-MM-DD HH:mm:ss"),
        end_time: event.value.is_all_day 
          ? dayjs(end_time).tz(timezone).format("YYYY-MM-DD 00:00:00")
          : dayjs(end_time).tz(timezone).format("YYYY-MM-DD HH:mm:ss"),
        atteendee_id: user.value.id,
        timezone_code: timezone
      }
    );

    const response = await axios.put(`${dirApi}tasks/${id}/attendeeLeaveTask`, {
      code: code,
      updated_date: formattedDate,
      start_time: event.value.is_all_day 
        ? dayjs(start_time).tz(timezone).format("YYYY-MM-DD 00:00:00")
        : dayjs(start_time).tz(timezone).format("YYYY-MM-DD HH:mm:ss"),
      end_time: event.value.is_all_day 
        ? dayjs(end_time).tz(timezone).format("YYYY-MM-DD 00:00:00")
        : dayjs(end_time).tz(timezone).format("YYYY-MM-DD HH:mm:ss"),
      atteendee_id: user.value.id,
      timezone_code: timezone
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if(response.data.code == 200) {
      message.success(response.data.message);
      emit("delete", id);
      handleClose();
    }
  } catch(error) {
    console.log(error);
  }
}

// chat
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const res = await axios.post(`${dirApi}group/message/send`, {
      group_id: groupInfo.value.group.id,
      message: newMessage.value,
      file: null,
      reply_to: replyingTo.value ? replyingTo.value.messageId : null,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
    });

    if(res.data.code == 200){
      newMessage.value = "";
      replyingTo.value = null;
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const setReply = (message) => {
  replyingTo.value = message;
};

const cancelReply = () => {
  replyingTo.value = null;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const getAttachments = async () => {
  loadingGetFiles.value = true;
  if(files.value && files.value.length == 0) {
    const response = await axios.get(`${dirApi}file-entry/${event.value.id}/files`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    try {
      files.value = response.data.files;
      console.log(files.value);
    } catch (error) {
      console.log(error);
    } finally {
      loadingGetFiles.value = false;
    }
  } else {
    loadingGetFiles.value = false;
  }
}

// Theo dõi thay đổi của messages và cuộn xuống cuối
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

watch(activeTab, (value) => {
  if(value == 'discuss') {
    scrollToBottom();
  }

  if(value == 'attachments') {
    getAttachments();
  }
});
const getMessagesByGroup = async (taskId) => {
  const response = await axios.get(`${dirApi}task/${taskId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  try {
    return response.data;
  } catch (error) {
    console.log("Loi xay ra khi lay tin nhan: ", error);
  }
}

const dayMap = {
  MO: "T2",
  TU: "T3",
  WE: "T4",
  TH: "T5",
  FR: "T6",
  SA: "T7",
  SU: "CN"
};

// Kiểm tra xem file có phải là ảnh không
const isImageFile = (mime) => {
  return mime.startsWith('image/');
};

// Lấy phần mở rộng của file
const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

// Format kích thước file
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const completeTask = async (id) => {
  let formData = {};
  if(event.value.type === 'task' && event.value.recurrence == 0) {
    formData = {
      is_done: 1,
      code: "EDIT_N",
      updated_date: dayjs(event.value.start).format("YYYY-MM-DD HH:mm:ss"),
      timezone_code: event.value.timezone,
      start_time: dayjs(event.value.start).format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(event.value.end).format("YYYY-MM-DD HH:mm:ss"),
      title: event.value.title,
      description: event.value.description || '',
      color_code: event.value.color,
      type: 'task',
    }
  } else {
    formData = {
      is_done: 1,
      code: "EDIT_1",
      updated_date: dayjs(event.value.start).format("YYYY-MM-DD HH:mm:ss"),
      timezone_code: event.value.timezone,
      start_time: dayjs(event.value.start).format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(event.value.end).format("YYYY-MM-DD HH:mm:ss"),
      title: event.value.title,
      description: event.value.description || '',
      color_code: event.value.color,
      type: 'task',
      attendees: [],
      location: '',
      is_all_day: event.value.is_all_day,
      is_private: event.value.is_private,
      is_reminder: event.value.is_reminder,
      reminder: [],
      is_busy: event.value.is_busy ? 1 : 0,  
      link: '',
    }
  }
  console.log(formData);
  const response = await axios.put(`${dirApi}tasks/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if(response.data.code == 200) {
    message.success(t('EventDetailsModal.task.completeSuccess'));
    emit("delete", id);
    handleClose();
  }
}

const downloadFile = async (file_name) => {
  try {
    const res = await axios.get(`${dirApi}s3/download/${file_name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.data.urlDowload) {
      const response = await fetch(res.data.urlDowload);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      message.error('Không tìm thấy link tải file.');
    }
  } catch (error) {
    console.log(error);
    message.error('Không thể tải file. Vui lòng thử lại sau.');
  }
}

const deleteFile = async (file_name) => {
  Modal.confirm({
    title: t('EventDetailsModal.attachments.deleteFile'),
    content: t('EventDetailsModal.attachments.deleteFileContent'),
    centered: true,
    onOk: async () => {
      try {
        const response = await axios.delete(`${dirApi}file-entry/delete`, {
          headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        file_names: [file_name]
      }
    });

    if(response.status == 200) {
      message.success(t('EventDetailsModal.attachments.deleteFileSuccess'));
      // Cập nhật lại danh sách file
      files.value = files.value.filter(file => file.file_name !== file_name);
    } else {
      message.error(t('EventDetailsModal.attachments.deleteFileError'));
    }
  } catch (error) {
        console.log(error);
        message.error(t('EventDetailsModal.attachments.deleteFileError'));
      }
    }
  });
}

function getRecurrenceText(event) {
  if (!event.info?.extendedProps?.freq) return '';

  const props = event.info.extendedProps;
  const freq = props.freq;
  const interval = props.interval || 1;
  const count = props.count;
  const until = props.until;
  const dayMap = {
    MO: t('EventDetailsModal.general.recurrence.days.monday'),
    TU: t('EventDetailsModal.general.recurrence.days.tuesday'),
    WE: t('EventDetailsModal.general.recurrence.days.wednesday'),
    TH: t('EventDetailsModal.general.recurrence.days.thursday'),
    FR: t('EventDetailsModal.general.recurrence.days.friday'),
    SA: t('EventDetailsModal.general.recurrence.days.saturday'),
    SU: t('EventDetailsModal.general.recurrence.days.sunday')
  };
  let text = '';

  // Frequency
  if (freq === 'daily') {
    text += interval <= 1 ? t('EventDetailsModal.general.recurrence.daily') :
      t('EventDetailsModal.general.recurrence.everyNDays', { n: interval });
  } else if (freq === 'weekly') {
    text += interval <= 1 ? t('EventDetailsModal.general.recurrence.weekly') :
      t('EventDetailsModal.general.recurrence.everyNWeeks', { n: interval });

    if (props.byweekday?.length > 0) {
      const days = props.byweekday.map(day => dayMap[day] || day).join(', ');
      text += `, ${t('EventDetailsModal.general.recurrence.on')} ${days}`;
    }
  } else if (freq === 'monthly') {
    text += interval <= 1 ? t('EventDetailsModal.general.recurrence.monthly') :
      t('EventDetailsModal.general.recurrence.everyNMonths', { n: interval });

    if (props.bymonthday?.length > 0) {
      const days = props.bymonthday.join(', ');
      text += `, ${t('EventDetailsModal.general.recurrence.on')} ${days}`;
    }
  } else if (freq === 'yearly') {
    text += interval <= 1 ? t('EventDetailsModal.general.recurrence.yearly') :
      t('EventDetailsModal.general.recurrence.everyNYears', { n: interval });
  }

  // Count
  if (count && count >= 1) {
    text += `, ${t('EventDetailsModal.general.recurrence.count', { count })}`;
  }

  // Until
  if (until && !count && dayjs(until).year() < 3000) {
    const formatted = dayjs(until).format('DD/MM/YYYY');
    text += `, ${t('EventDetailsModal.general.recurrence.until', { date: formatted })}`;
  }

  return text;
}

</script>

<template>
  <Modal v-model:open="isVisible" width="750px" :footer="null" :closable="false" :centered="true">

    <div class="flex items-center justify-end mr-2 space-x-3">
      <button
        v-if="event.user_id == user.id || (event.attendees && event.attendees.some(attendee => attendee.user_id == user.id && attendee.role == 'editor' && attendee.status == 'yes'))"
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="handleEditTask">
        <EditOutlined class="text-xl" />
      </button>
      <button
        v-if="event.user_id == user.id || (event.attendees && event.attendees.some(attendee => attendee.user_id == user.id && attendee.role == 'editor' && attendee.status == 'yes'))"
        class="text-gray-800 px-[10px] py-2 border-none rounded-full cursor-pointer bg-transparent hover:bg-gray-100 transition"
        @click="handleDelete">
        <DeleteOutlined class="text-xl" />
      </button>
      <button
        v-if="(event.user_id == user.id && !event.is_private) && (event.type == 'event')"
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
      <a-tab-pane key="infoEvent" :tab="t('EventDetailsModal.tab.general')">
        <!-- Event content -->
        <div class="px-4">
          <!-- Event title -->
          <div class="flex items-center mb-4">
            <div class="w-6 h-6 rounded-full mr-3" :style="{background: event.color}"></div>
            <h2 class="text-xl font-bold  mb-0">{{ event.title }}</h2>
          </div>

          <!-- Date and time -->
          <div class="flex flex-col mb-4">
            <div class="flex">
              <div class="w-6 h-6 flex-shrink-0 mr-3">
                <ClockCircleOutlined class="text-xl text-gray-500" />
              </div>
  
              <div class="">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.time') }}</p>
              </div>
            </div>

            <div>
              
              <!-- Thời gian theo múi giờ sự kiện -->
              <div class="border border-1 !border-gray-300 rounded-md shadow-sm p-2">
                <p class="text-sm text-gray-500 font-semibold mb-2 ml-1">{{ t('EventDetailsModal.general.timeEvent') }}</p>
                <div class="flex flex-col ml-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex items-center space-x-2">
                      <CalendarOutlined class="text-gray-500" />
                      <p class="text-gray-800 mb-0">
                        {{ formatDateTime(event.start, event.timezone) }} - {{ event.end ? formatDateTime(event.end, event.timezone) : '' }}
                      </p>
                    </div>
                    <div class="ml-10">
                      <div class="flex items-center space-x-2" v-if="!event.is_all_day">
                        <ClockCircleOutlined class="text-gray-500" />
                        <p class="text-gray-800 mb-0">
                          {{ formatTimeInfo(event.start, event.timezone) }} - {{ event.end ? formatTimeInfo(event.end, event.timezone) : '' }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2 col-span-2" v-if="event.is_all_day">
                        <ClockCircleOutlined class="text-gray-500" />
                        <p class="text-gray-800 mb-0">{{ t('EventDetailsModal.general.timeAllDay') }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <GlobalOutlined class="text-gray-500" />
                    <p class="text-gray-800 mb-0">{{ event.timezone }}</p>
                  </div>
                </div>
              </div>

              <!-- Thời gian theo múi giờ người dùng -->
              <div v-if="userTimezone != event.timezone" class="border-gray-300 p-2 shadow-sm">
                <p class="text-sm text-gray-500 font-semibold mb-2 ml-1">{{ t('EventDetailsModal.general.timeSetting') }}</p>
                <div class="flex flex-col ml-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex items-center space-x-2">
                      <CalendarOutlined class="text-gray-500" />
                      <p class="text-gray-800 mb-0">
                        {{ dayjs(event.start).tz(userTimezone).format("dddd, D/M/YYYY") }} - 
                        {{ event.end ? dayjs(event.end).tz(userTimezone).format("dddd, D/M/YYYY") : '' }}
                      </p>
                    </div>
                    <div class="ml-10">
                      <div class="flex items-center space-x-2" v-if="!event.is_all_day">
                        <ClockCircleOutlined class="text-gray-500" />
                        <p class="text-gray-800 mb-0">
                          {{ dayjs(event.start).tz(userTimezone).format("HH:mm") }} - 
                          {{ event.end ? dayjs(event.end).tz(userTimezone).format("HH:mm") : '' }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2 col-span-2" v-if="event.is_all_day">
                        <ClockCircleOutlined class="text-gray-500" />
                        <p class="text-gray-800 mb-0">{{ t('EventDetailsModal.general.timeAllDay') }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <GlobalOutlined class="text-gray-500" />
                    <p class="text-gray-800 mb-0">{{ userTimezone }}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Lặp lại -->
          <div class="flex flex-col mb-2" v-if="event.recurrence && event.recurrence != 0">
            <div class="flex">
              <div class="w-6 h-6 flex-shrink-0 mr-3">
                <HistoryOutlined class="text-xl text-gray-500" />
              </div>
              <div class="flex items-center">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.recurrence.title') }}</p>
              </div>
            </div>
            <div class="ml-9">
              <p class="text-gray-800 mb-0">{{ getRecurrenceText(event) }}</p>
            </div>
          </div>


          <div class="flex items-start mb-2" v-if="event.description">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <AlignLeftOutlined class="text-xl text-gray-500" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.description') }}</p>
              </div>
              
              <p class="text-gray-800" v-html="event.description"></p>
            </div>
          </div>

          <!-- Participants -->
          <div class="flex items-start mb-2" v-if="event.attendees && event.attendees.length > 0">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <UsergroupAddOutlined class="text-xl text-gray-500" />
            </div>
            <div class="w-full">
              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <p class="font-medium">{{ event.attendees.length }} {{ t('EventDetailsModal.general.participants') }} |</p>
                  <p class="text-xs mt-1 text-gray-600">
                    <span>{{ event.attendees.filter(attendee => attendee.status === 'yes').length }} {{ t('EventDetailsModal.general.agree') }}
                      {{ event.attendees.filter(attendee => attendee.status === 'pending').length > 0 ?
                      `,${event.attendees.filter(attendee => attendee.status === 'pending').length} ${t('EventDetailsModal.general.pending')}` : '' }}
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
          <div class="flex items-start mb-2" v-if="event.location">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <EnvironmentOutlined class="h-6 w-6 text-gray-500 text-xl" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.location') }}</p>
              </div>
              <p class="text-sm text-gray-600">{{ event.location || 'Không có' }}</p>
            </div>
          </div>

          <!-- Reminder -->
          <div class="flex items-start mb-2" v-if="event.is_reminder">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <BellOutlined class="h-6 w-6 text-gray-500 text-xl" />
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.reminder') }}</p>
              </div>

              <p class="text-sm text-gray-600 mb-0" v-for="(time, index) in event.reminder" :key="index">
                {{ t('EventDetailsModal.general.before') }} {{ time.set_time >= 60 ? time.set_time / 60 : time.set_time }} {{ time.set_time >= 60 ? 
                t('EventDetailsModal.general.hour') : t('EventDetailsModal.general.minute') }} - {{ time.type }}
              </p>
            </div>
          </div>

          <!-- Calendar -->
          <div class="flex items-start" v-if="event.type == 'event'">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center">
                <p class="font-medium mb-0">{{ t('EventDetailsModal.general.calendar') }}</p>
                <div v-if="event.tag_color_code" class="w-3 h-3 rounded-full ml-1" :style="{ backgroundColor: event.tag_color_code }"></div>
              </div>
              <p class="text-sm text-gray-600">{{ event.tag_name || 'Không có' }}</p>
            </div>
          </div>

          <div class="flex items-start" v-if="event.is_private">
            <div class="w-6 h-6 flex-shrink-0 mr-3">
              <FileProtectOutlined class="text-xl text-gray-500 w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold mb-0">{{ t('EventDetailsModal.general.private') }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="event.attendees && event.attendees.some(attendee => attendee.user_id == user.id && attendee.status == 'yes')"
          class="flex justify-center">
          <p class="text-green-500 mb-0">{{ t('EventDetailsModal.general.youAreParticipating') }}</p>
        </div>
        <div
          v-else-if="event.attendees && event.attendees.some(attendee => attendee.user_id == user.id && attendee.status == 'pending')"
          class="flex justify-center">
          <p class="text-yellow-500 mb-0">{{ t('EventDetailsModal.general.wantToParticipate') }}</p>
        </div>

        <div v-if="event.attendees && event.attendees.length > 0 && user.id != event.user_id && event.attendees.some(attendee => attendee.user_id == user.id && attendee.status != 'yes')"
          class="flex justify-center p-4">
          <div class="flex items-center space-x-2">
            <button @click="accept(event.uuid)"
              class="px-3 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100 font-semibold hover:text-blue-500 transition flex items-center ">
              <CheckOutlined class="mr-1" />
              {{ t("EventDetailsModal.general.yes") }}
            </button>
            <button @click="refuse(event.uuid)"
              class="px-3 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100 font-semibold hover:text-blue-500 transition flex items-center">
              <CloseOutlined class="mr-1" />
              {{ t("EventDetailsModal.general.no") }}
            </button>
          </div>
        </div>
        <div v-else-if="event.attendees && event.attendees.length > 0 && user.id != event.user_id && event.attendees.some(attendee => attendee.user_id == user.id && attendee.status == 'yes')"
          class="flex justify-center p-4">
          <div class="flex items-center space-x-2">
            <button @click="leaveEvent(event.id)"
              class="px-3 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100 font-semibold hover:text-blue-500 transition flex items-center ">
              <FrownOutlined class="mr-1" />
              {{ t("EventDetailsModal.general.leave") }}
            </button>
          </div>
        </div>

        <div v-if="event.type == 'task'" class="flex justify-end">
          <p v-if="event.is_done == 0" class="text-gray-500 p-2 hover:bg-gray-100 rounded-lg text-sm font-semibold cursor-pointer hover:text-blue-500 transition" @click="completeTask(event.id)">{{ t('EventDetailsModal.task.markAsDone') }}</p>
          <p v-else class="text-gray-500 p-2 text-sm font-semibold cursor-pointer hover:text-blue-500 transition text-end">{{ t('EventDetailsModal.task.complete') }}</p>
        </div>
      </a-tab-pane>

      <a-tab-pane key="attachments" :tab="t('EventDetailsModal.tab.attachments')" v-if="event.type == 'event'">
        <div class="p-4">
          <div 
            v-if="files?.length > 0" 
            class="max-h-[500px] overflow-y-auto pr-2 scroll-smooth"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div v-for="(file, index) in files" :key="index" class="border rounded-lg p-4 flex flex-col">
                <!-- Icon hoặc ảnh -->
                <div class="mb-3 flex items-center justify-center h-48 bg-gray-50 rounded-lg" 
                    v-if="!['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(file.extension)">
                  <div class="text-center">
                    <FileOutlined v-if="file.extension == 'pdf'" class="text-4xl text-red-500" />
                    <FileWordOutlined v-else-if="['doc', 'docx'].includes(file.extension)" class="text-4xl text-blue-500" />
                    <FileExcelOutlined v-else-if="['xls', 'xlsx'].includes(file.extension)" class="text-4xl text-green-500" />
                    <FilePptOutlined v-else-if="['ppt', 'pptx'].includes(file.extension)" class="text-4xl text-orange-500" />
                    <FileTextOutlined v-else class="text-4xl text-gray-500" />
                    <div class="mt-2 text-sm text-gray-600">{{ file.extension.toUpperCase() }}</div>
                  </div>
                </div>
                <div class="mb-3 flex items-center justify-center h-48 bg-gray-50 rounded-lg" v-else>
                  <img :src="file.url" alt="File" class="w-full h-full object-cover rounded-lg">
                </div>

                <!-- Thông tin file -->
                <div class="flex flex-col">
                  <div class="font-medium text-gray-900 truncate" :title="file.client_name">
                    {{ file.client_name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ new Date(file.created_at).toLocaleDateString() }}</div>
                </div>

                <!-- Nút -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="mt-3">
                    <a @click.prevent="downloadFile(file.file_name)" target="_blank" download
                      class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#227CD9]">
                      <DownloadOutlined class="mr-2" />
                      {{ t('EventDetailsModal.attachments.download') }}
                    </a>
                  </div>
                  <div class="mt-3">
                    <a @click.prevent="deleteFile(file.file_name)" 
                      class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#FE6D73]">
                      <DeleteOutlined class="mr-2" />
                      {{ t('EventDetailsModal.attachments.delete') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading / No attachments -->
          <div v-else class="text-center text-gray-500 py-8">
            <div class="flex items-center justify-center space-x-2" v-if="loadingGetFiles">
              <div class="border-t-4 border-blue-500 border-solid w-8 h-8 rounded-full animate-spin"></div>
              <span>{{ t('EventDetailsModal.attachments.loading') }}</span>
            </div>
            <div v-else>
              <p class="text-sm text-gray-400 italic">{{ t('EventDetailsModal.attachments.noAttachments') }}</p>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane v-if="event.type == 'event' && event.attendees.length > 0" key="discuss" :tab="t('EventDetailsModal.tab.discussion')">
        <div class="flex bg-gray-100 h-[550px]">
          <!-- Main chat area -->
          <div class="flex-1 flex flex-col">
            
            <!-- Messages area -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
              <!-- Hiển thị nếu chưa có tin nhắn -->
              <div v-if="messages.length == 0" class="flex items-center justify-center h-full">
                <div class="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p>{{ t('EventDetailsModal.discussion.noMessages') }}</p>
                </div>
              </div>

              <!-- Danh sách tin nhắn -->
              <div v-for="(message, index) in messages" :key="index" class="flex items-end space-x-2"
                :class="{ 'justify-end': message.userId == user.id }">
                
                <!-- Avatar bên trái nếu là tin nhắn của người khác -->
                <img v-if="message.userId != user.id" class="w-8 h-8 rounded-full" :src="message.avatar || unknowUser" alt="User Avatar" />

                <!-- Nội dung tin nhắn -->
                <div class="relative max-w-xs md:max-w-md p-3 rounded-xl shadow"
                  :class="{
                    'bg-blue-500 text-white rounded-br-none': message.userId == user.id,
                    'bg-white text-gray-800 rounded-bl-none': message.userId != user.id
                  }">
                  
                <span class="block font-semibold text-gray-500"
                  :class="{
                      'text-white text-end text-xs': message.userId == user.id,
                      'text-gray-800 text-xs': message.userId != user.id
                    }"
                >{{ message.name }}</span>

                  <!-- Hiển thị tin nhắn được trích dẫn -->
                  <div v-if="message.replyTo" class="mb-2 p-2 border-l-4 border-blue-400 bg-blue-100 rounded-lg text-gray-700 text-xs">
                    <span class="block font-semibold text-gray-500">{{ message.replyTo.name }}</span>
                    <span>{{ message.replyTo.text }}</span>
                  </div>

                  <!-- Nội dung chính của tin nhắn -->
                  <p class="text-sm">{{ message.text }}</p>

                  <!-- Thời gian gửi -->
                  <div class="text-xs text-right text-gray-300 mt-1">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>

                <!-- Avatar bên phải nếu là tin nhắn của user -->
                <img v-if="message.userId == user.id" class="w-8 h-8 rounded-full" :src="message.avatar || unknowUser" alt="User Avatar" />

                <!-- Nút trả lời -->
                <div @click="setReply(message)" class="flex items-center align-middle justify-center">
                  <button v-if="message.userId != user.id" class="text-sm border-none mb-[50%] px-2 py-1 rounded-full transition bg-sky-100 hover:bg-sky-200 cursor-pointer text-blue-600 ml-2">
                    <CommentOutlined />
                  </button>
                </div>
              </div>
            </div>

            <!-- Input area -->
            <div class="bg-white border-t py-2 border-gray-200">
              <div v-if="replyingTo" class="p-2 bg-gray-100 border-l-4 border-blue-500 rounded flex items-center justify-between">
                <p class="text-sm text-gray-600">{{ t('EventDetailsModal.discussion.replyingTo') }} <b>{{ replyingTo.text }}</b></p>
                <button class="text-[#FE6D73] bg-transparent text-xs border-none cursor-pointer hover:bg-[#FE6D73] hover:text-white transition rounded-full px-[10px] py-2" @click="cancelReply"><CloseOutlined /></button>
              </div>
              <form @submit.prevent="sendMessage" class="flex space-x-2 w-full">
                <div class="flex-1 w-11/12">
                  <input v-model="newMessage"
                    class="flex-1 border w-full px-2 border-[#227C9D] rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="t('EventDetailsModal.discussion.placeholder')" />
                </div>
                <div class="w-1/12">
                  <button type="submit"
                    class="bg-[#227C9D] text-white w-full h-full transition rounded-lg border-none cursor-pointer hover:bg-[#15C5B2] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
