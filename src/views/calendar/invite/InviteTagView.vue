<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import unknowUser from '@/assets/images/unknow_user.jpg';
import bgImage from '@/assets/images/backgroundtag.jpg';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const currentUser = ref(JSON.parse(localStorage.getItem('user')));
const loading = ref(true);
const loadingAccept = ref(false);  // loading cho nút Chấp nhận
const loadingDecline = ref(false); // loading cho nút Từ chối
const error = ref(null);
const tagData = ref({});
const isOwner = ref(false);

onMounted(async () => {
    try {
        const res = await axios.get(`${dirApi}tags/${route.params.uuid}/invite`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        tagData.value = {
            ...res.data.data.tag,
            owner: res.data.data.owner,
            shared_user: res.data.data.shared_user,
        };
        console.log(tagData.value);
        isOwner.value = res.data.data.is_owner;
    } catch (err) {
        if (err.response.data.code == 404) {
            message.info(t('InviteTag.error.notFound'));
            router.push('/calendar');
        } 
        error.value = t('InviteTag.error.fetch');
    } finally {
        loading.value = false;
    }
});

const acceptInvitation = async () => {
    loadingAccept.value = true;
    try {
        await axios.post(`${dirApi}tags/${route.params.uuid}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        message.success(t('InviteTag.success.accepted'));
        router.push('/calendar');
    } catch {
        message.error(t('InviteTag.error.cannotAccept'));
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
        message.success(t('InviteTag.success.declined'));
        router.push('/calendar');
    } catch {
        message.error(t('InviteTag.error.cannotReject'));
    } finally {
        loadingDecline.value = false;
    }
};

const isInvited = computed(() => {
  return tagData.value.shared_user?.some(user =>
    user.user_id == currentUser.value.id && user.status == 'pending'
  );
});

const backToHome = () => {
    router.push('/calendar');
};
</script>

<template>
    <div v-if="!loading && tagData" class="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
        <!-- Header with calendar icon -->
        <div class="bg-blue-50 rounded-lg mb-4 w-full h-48 bg-cover bg-center"
            :style="{ backgroundImage: `url(${bgImage})` }"></div>

        <!-- Event details -->
        <div class="space-y-2">
            <!-- Tiêu đề -->
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-1 uppercase tracking-wide">{{ t('InviteTag.title') }} <span :style="{ color: tagData.color_code }">{{ tagData.name }}</span></h2>
            <p class="text-gray-600 text-center text-sm mb-6 max-w-lg mx-auto">
                {{ t('InviteTag.subContent') }}
            </p>
            <hr>

            <!-- Attendees -->
            <div class="space-y-1 -mb-1">
                <div class="flex items-center gap-2">
                    <div class="text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm">{{t('InviteTag.listAtendees')}}</div>
                    </div>
                </div>
            </div>

            <!-- Organizer -->
            <div class="max-h-60 overflow-y-auto pr-2">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-10 h-10 rounded-full flex align-center justify-center">
                        <img class="w-10 h-10 rounded-full" :src="tagData.owner?.avatar ?? unknowUser" alt="">
                    </div>
                    <div>
                        <div class="text-sm font-medium">
                            {{ tagData.owner?.first_name }} {{ tagData.owner?.last_name }}
                            - <span class="text-green-500 text-sm">{{ t('InviteTag.owner') }}</span>
                        </div>
                        <div class="text-xs text-gray-500">{{ tagData.owner?.email }}</div>
                    </div>
                </div>

                <template v-for="attendee in tagData.shared_user ?? []" :key="attendee.user_id">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-10 h-10 rounded-full flex align-center justify-center">
                            <img class="w-10 h-10 rounded-full" :src="attendee.avatar ?? unknowUser" alt="">
                        </div>
                        <div>
                            <div class="text-sm font-medium">{{ attendee.first_name }} {{ attendee.last_name }} 
                                <span
                                :class="`text-[10px] ${
                                    attendee.status == 'yes'
                                    ? 'text-green-600'
                                    : attendee.status == 'pending'
                                    ? 'text-yellow-500'
                                    : 'text-red-500'
                                }`"
                                >
                                ({{ t(`InviteTag.${attendee.status}`) }})
                                </span>
                            </div>
                            <div class="text-xs text-gray-500">{{ attendee.email }}</div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Email response -->
            <div class="text-center text-sm" v-if="!isOwner && isInvited">
                <div class="mb-4">{{ t('InviteTag.joinContent') }}</div>
                <div class="flex gap-2 justify-center">
                    <button @click.prevent="acceptInvitation"
                        class="px-4 py-2 bg-orange-500 border-0 text-white cursor-pointer rounded-md hover:bg-orange-300 transition">
                        {{ t('Invite.yes') }}
                    </button>
                    <button @click.prevent="declineInvitation"
                        class="px-4 py-2 bg-gray-200 text-gray-800 border-0 cursor-pointer rounded-md hover:bg-gray-100 transition">
                        {{ t('Invite.no') }}
                    </button>
                </div>
            </div>
            <div v-else class="text-green-500 text-center text-sm">
                <div class="mb-4">{{ t('InviteTag.hasJoined') }}</div>
                <button @click.prevent="backToHome"
                    class="px-4 py-2 bg-orange-500 border-0 text-white cursor-pointer rounded-md hover:bg-orange-300 transition">
                    {{ t('back') }}
                </button>
            </div>
        </div>
    </div>

    <!-- Loading or error -->
    <div v-else class="text-center py-10 text-gray-400">
        <div v-if="error">{{ error }}</div>
        <div v-else>
            <a-spin />
            {{ t('InviteTag.loading') }}
        </div>
    </div>
</template>
