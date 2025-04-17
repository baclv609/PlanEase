<template>
    <div class="modal-container fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">

            <h2 class="text-xl font-semibold mb-4 text-gray-800">{{ t('MailModal.main-modal') }}</h2>

            <form class="space-y-5">
                <!-- Người nhận -->
                <div>
                    <label class="text-sm font-medium text-gray-700">{{ t('MailModal.receive_person') }}</label>
                    <!-- Tag list -->
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                        <div v-for="user in attendees" :key="user.id"
                            class="flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-1 py-0.5 rounded-full shadow-sm">
                            <img :src="user.avatar || defaultAvatar" class="w-6 h-6 rounded-full" alt="">
                            <span class="text-xs">{{ user.email }}</span>
                            <button @click="removeAttendee(user)" class="border-none bg-transparent">
                                <CloseOutlined
                                    class="cursor-pointer text-sm font-bold text-gray-500 transition hover:text-gray-700" />
                            </button>
                        </div>
                    </div>

                    <!-- Search input -->
                    <input v-model="searchQuery" @input="filterUsers" type="text"
                        :placeholder="t('MailModal.placeholder.search')"
                        class="w-full mt-1 px-4 py-2 border border-black rounded-[5px] shadow-sm
                                focus:outline-none focus:border-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition relative" />

                    <!-- Suggestion dropdown -->
                    <div v-if="filteredUsers.length > 0"
                        class="mt-2 absolute z-[10000] bg-white border border-gray-200 transition rounded-md shadow-md max-h-56 overflow-y-auto">
                        <div v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)"
                            class="cursor-pointer flex items-center px-3 py-2 hover:bg-gray-100 text-sm">
                            <img :src="user.avatar" alt="avatar" class="w-6 h-6 rounded-full mr-2" />
                            <span>{{ user.email }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tiêu đề -->
                <div>
                    <label class="text-sm font-medium text-gray-700">{{ t('MailModal.title') }}</label>
                    <input v-model="title" :placeholder="t('MailModal.title')"
                        class="w-full mt-1 px-4 py-2 border border-black rounded-[5px] shadow-sm
                                focus:outline-none focus:border-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                </div>

                <!-- Nội dung -->
                <div>
                    <label class="text-sm font-medium text-gray-700">{{ t('MailModal.content') }}</label>
                    <textarea v-model="content" :placeholder="t('MailModal.placeholder.content')" rows="4"
                        class="w-full mt-1 px-4 py-2 border border-black rounded-[5px] shadow-sm
                                focus:outline-none focus:border-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"></textarea>
                </div>

                <!-- Footer -->
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span>{{ t('MailModal.receive-location') }}</span>
                    <div class="flex gap-3">
                        <button type="button" @click="$emit('close')"
                            class="text-gray-600 px-3 py-2 border-none hover:bg-gray-300 rounded cursor-pointer font-semibold">
                            {{ t('MailModal.cancel') }}</button>
                        <button type="submit" :disabled="isSendDisabled" @click.prevent="sendMailToOthers"
                            class="bg-blue-600 border-none font-semibold text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ t('MailModal.send') }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, watch, onMounted, watchEffect, computed } from 'vue';
import defaultAvatar from '@/assets/images/unknow_user.jpg';
import { CloseOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';


const props = defineProps({
    eventId: String,
});
const { t } = useI18n();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const eventId = ref(props.eventId);
const title = ref('');
const allUsers = ref([]);
const content = ref('');
const searchQuery = ref('');
const filteredUsers = ref([]);
const attendees = ref([]);
const currentUser = JSON.parse(localStorage.getItem('user'));

const emit = defineEmits(['close'])

// Hàm lọc người dùng dựa trên query tìm kiếm
const filterUsers = () => {
    const query = searchQuery.value.toLowerCase();

    if (!query) {
        filteredUsers.value = [];
        return;
    }

    filteredUsers.value = allUsers.value.filter(user =>
        user.email.toLowerCase().includes(query) &&
        user.id != currentUser.id
    );
};

// Hàm chọn người dùng và thêm vào danh sách attendees
const selectUser = (user) => {
    if (!attendees.value.some(attendee => attendee.id === user.id)) {
        attendees.value.push(user); // Thêm user vào attendees
    }
    searchQuery.value = '';
    filteredUsers.value = [];
};

const isSendDisabled = computed(() => {
    return attendees.value.length == 0 || !content.value.trim();
});

watchEffect(async () => {
    // console.log('Giá trị eventId đang được theo dõi:', props.eventId);
    if (props.eventId) {
        try {
            const response = await axios.get(`${dirApi}tasks/${props.eventId}/infoEvent`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.code == 200) {
                allUsers.value = response.data.data.users;
                title.value = response.data.data.event.title;
                attendees.value = response.data.data.users.filter(user => user.id != currentUser.id)
                // console.log('Tất cả người dùng:', allUsers.value);
            }
        } catch (error) {
            console.error('Failed to fetch event info:', error);
        }
    }
});

const removeAttendee = (user) => {
    attendees.value = attendees.value.filter(att => att.id != user.id);
}

// Gửi email
const sendMailToOthers = async () => {

    // console.log({
    //     title: title.value,
    //     content: content.value,
    //     id: props.eventId,
    //     attendees: attendees.value
    // })

    const response = await axios.post(`${dirApi}tasks/sendMailToOthers`, {
        title: title.value,
        content: content.value,
        id: props.eventId,
        attendees: attendees.value
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    try {
        if (response.data.code == 200) {
            message.success(t("MailModal.success"));
            emit('close');
        }
    } catch (error) {
        message.error(t("MailModal.error"))
        console.log(error);
    }
}
</script>

<style scoped>
.avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}
</style>
