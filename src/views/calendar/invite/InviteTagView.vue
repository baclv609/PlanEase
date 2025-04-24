<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6">
            <!-- Loading -->
            <div v-if="loading" class="text-center text-gray-600">
                <a-spin />
                <p class="mt-4 text-base">Đang tải thông tin lời mời...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="text-center text-red-500 font-medium">
                {{ error }}
            </div>

            <!-- Nội dung chính -->
            <div v-else class="space-y-6">
                <!-- Tiêu đề -->
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-gray-800">Lời mời tham gia Tag</h2>
                    <p class="text-gray-500 mt-1 text-sm">Bạn đã được mời tham gia tag</p>
                </div>

                <!-- Thông tin Tag -->
                <div class="flex items-center gap-4 bg-gray-50 border rounded-xl p-2">
                    <div class="w-6 h-6 rounded-full" :style="{ backgroundColor: tagData.color_code }"></div>
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800">{{ tagData.name }}</h3>
                        <p v-if="tagData.description" class="text-sm text-gray-600 mt-1">
                            {{ tagData.description }}
                        </p>
                    </div>
                </div>

                <!-- Người tạo Tag -->
                <div class="border-t">
                    <p class="text-sm text-gray-600 mb-2">Người tạo Tag:</p>
                    <div class="flex items-center">
                        <a-avatar :src="tagData.owner?.avatar" :size="40" class="shadow-md">
                            {{ !tagData.owner?.avatar ? getInitials(tagData.owner?.first_name, tagData.owner?.last_name)
                                : '' }}
                        </a-avatar>
                        <div class="ml-3">
                            <p class="font-medium text-gray-800">
                                {{ tagData.owner?.first_name }} {{ tagData.owner?.last_name }}
                                <span v-if="isOwner" class="text-xs ml-2 text-blue-500 font-semibold">(Chủ sở
                                    hữu)</span>
                            </p>
                            <p class="text-sm text-gray-500">{{ tagData.owner?.email }}</p>
                        </div>
                    </div>
                </div>

                <!-- Người được chia sẻ -->
                <div v-if="tagData.shared_user?.length" class="border-t">
                    <p class="text-sm text-gray-600 mb-2">Người tham gia:</p>
                    <div class="space-y-3">
                        <div v-for="user in tagData.shared_user" :key="user.email" class="flex items-center gap-3">
                            <a-avatar :src="user.avatar" :size="32">
                                {{ !user.avatar ? getInitials(user.first_name, user.last_name) : '' }}
                            </a-avatar>
                            <div>
                                <p class="text-sm font-medium text-gray-800">{{ user.first_name }} {{ user.last_name }}
                                </p>
                                <p class="text-xs text-gray-500">{{ user.email }} • Vai trò: {{ user.role }} • Trạng
                                    thái:
                                    <span :class="{
                                        'text-yellow-500': user.status === 'pending',
                                        'text-green-500': user.status === 'accepted',
                                        'text-red-500': user.status === 'refused'
                                    }">{{ user.status }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nút hành động -->
                <div class="flex justify-center gap-4 mt-6">
                    <a-button type="primary" :loading="loadingAccept" @click="acceptInvitation" class="px-6">
                        Chấp nhận
                    </a-button>

                    <a-button danger :loading="loadingDecline" @click="declineInvitation" class="px-6">
                        Từ chối
                    </a-button>
                </div>

            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const loading = ref(true);
const loadingAccept = ref(false);  // loading cho nút Chấp nhận
const loadingDecline = ref(false); // loading cho nút Từ chối
const error = ref(null);
const tagData = ref({});
const isOwner = ref(false);

const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
};

const fetchInviteDetails = async () => {
    try {
        const res = await axios.get(`${dirApi}tags/${route.params.uuid}/invite`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        tagData.value = {
            ...res.data.data.tag,
            owner: res.data.data.owner,
            shared_user: res.data.data.tag.shared_user,
        };
        isOwner.value = res.data.data.is_owner;
    } catch (err) {
        error.value = 'Không thể tải thông tin lời mời. Vui lòng thử lại sau.';
    } finally {
        loading.value = false;
    }
};

const acceptInvitation = async () => {
    loadingAccept.value = true;
    try {
        await axios.post(`${dirApi}tags/${route.params.uuid}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Đã chấp nhận lời mời thành công');
        router.push('/calendar');
    } catch {
        message.error('Không thể chấp nhận lời mời. Vui lòng thử lại sau.');
    } finally {
        loadingAccept.value = false;
    }
};

const declineInvitation = async () => {
    loadingDecline.value = true;
    try {
        await axios.post(`${dirApi}tags/${route.params.uuid}/refuse`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Đã từ chối lời mời');
        router.push('/calendar');
    } catch {
        message.error('Không thể từ chối lời mời. Vui lòng thử lại sau.');
    } finally {
        loadingDecline.value = false;
    }
};

onMounted(() => {
    fetchInviteDetails();
});
</script>
