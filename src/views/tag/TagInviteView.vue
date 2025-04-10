<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          {{ t('tag.invite.title') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('tag.invite.description') }}
        </p>
      </div>

      <div v-if="loading" class="flex justify-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="error" class="text-center">
        <a-alert
          :message="error"
          type="error"
          show-icon
          class="mb-4"
        />
        <a-button type="primary" @click="router.push('/calendar')">
          {{ t('common.backToCalendar') }}
        </a-button>
      </div>

      <div v-else class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center" :style="{ backgroundColor: tag.color_code + '20' }">
            <span class="text-3xl" :style="{ color: tag.color_code }">
              {{ tag.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <h3 class="mt-4 text-xl font-semibold text-gray-900">{{ tag.name }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ tag.description }}</p>
        </div>

        <div class="mt-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-medium text-gray-700">{{ t('tag.invite.role') }}</span>
            <a-tag :color="tag.role === 'editor' ? 'blue' : 'green'">
              {{ tag.role === 'editor' ? t('event.roles.editor') : t('event.roles.viewer') }}
            </a-tag>
          </div>

          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-medium text-gray-700">{{ t('tag.invite.owner') }}</span>
            <span class="text-sm text-gray-500">{{ tag.owner_name }}</span>
          </div>

          <div class="mt-6 flex justify-between space-x-4">
            <a-button
              type="default"
              class="flex-1"
              @click="router.push('/calendar')"
            >
              {{ t('common.decline') }}
            </a-button>
            <a-button
              type="primary"
              class="flex-1"
              :loading="accepting"
              @click="handleAccept"
            >
              {{ t('common.accept') }}
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');

const loading = ref(true);
const error = ref(null);
const accepting = ref(false);
const tag = ref({
  name: '',
  description: '',
  color_code: '',
  role: '',
  owner_name: '',
});

const fetchTagInvite = async () => {
  try {
    const response = await axios.get(`${dirApi}tags/invite/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 200) {
      tag.value = response.data.data;
    } else {
      error.value = response.data.message || t('tag.invite.error.fetch');
    }
  } catch (err) {
    console.error('Error fetching tag invite:', err);
    error.value = t('tag.invite.error.fetch');
  } finally {
    loading.value = false;
  }
};

const handleAccept = async () => {
  accepting.value = true;
  try {
    const response = await axios.post(
      `${dirApi}tags/invite/${route.params.id}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.code === 200) {
      message.success(t('tag.invite.success.accepted'));
      router.push('/calendar');
    } else {
      message.error(response.data.message || t('tag.invite.error.accept'));
    }
  } catch (err) {
    console.error('Error accepting tag invite:', err);
    message.error(t('tag.invite.error.accept'));
  } finally {
    accepting.value = false;
  }
};

onMounted(() => {
  fetchTagInvite();
});
</script> 