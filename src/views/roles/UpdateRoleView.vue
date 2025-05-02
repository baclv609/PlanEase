<!-- <template>
    <div class="update-role-container">
        <a-button class="back-button" type="primary" ghost @click="goBack">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Quay lại danh sách
        </a-button>

        <a-card title="Cập nhật Role" :bordered="false" class="form-card">
            <template #extra>
                <a-tag :color="role?.deleted_at ? 'pink' : 'green'">
                    {{ role?.deleted_at ? 'Không hoạt động' : 'Đang hoạt động' }}
                </a-tag>
            </template>

            <div v-if="loading" class="loading-container">
                <a-spin size="large" />
                <p>Đang tải thông tin...</p>
            </div>

            <a-form
                v-else
                :model="formState"
                name="updateRole"
                @finish="onFinish"
                :rules="rules"
                layout="vertical"
            >
                <a-form-item
                    label="Tên Role"
                    name="name"
                >
                    <a-input 
                        v-model:value="formState.name"
                        placeholder="Nhập tên role"
                        :maxLength="255"
                    />
                </a-form-item>

                <a-form-item>
                    <a-space>
                        <a-button 
                            type="primary" 
                            html-type="submit" 
                            :loading="submitting"
                        >
                            <template #icon><SaveOutlined /></template>
                            Lưu thay đổi
                        </a-button>
                        <a-button @click="goBack">
                            Hủy
                        </a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const loading = ref(true);
const submitting = ref(false);
const role = ref(null);

const formState = reactive({
    name: ''
});

const rules = {
    name: [
        { required: true, message: 'Vui lòng nhập tên role' },
        { max: 255, message: 'Tên role không được vượt quá 255 ký tự' }
    ]
};

// Fetch role detail
const fetchRoleDetail = async () => {
    try {
        const response = await axios.get(`${dirApi}admin/roles/${route.params.id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.data.code === 200) {
            role.value = response.data.data;
            formState.name = response.data.data.name;
        } else {
            message.error('Không thể tải thông tin role');
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin role:', error);
        message.error('Có lỗi xảy ra khi tải thông tin role');
    } finally {
        loading.value = false;
    }
};

const onFinish = async (values) => {
    submitting.value = true;
    try {
        const response = await axios.put(
            `${dirApi}admin/roles/${route.params.id}`,
            { name: values.name },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );

        if (response.data.code === 200) {
            message.success('Cập nhật role thành công');
            router.push('/dashboard/roles');
        } else {
            message.error(response.data.message || 'Có lỗi xảy ra khi cập nhật role');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật role:', error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error('Có lỗi xảy ra khi cập nhật role');
        }
    } finally {
        submitting.value = false;
    }
};

const goBack = () => {
    router.push('/dashboard/roles');
};

onMounted(() => {
    fetchRoleDetail();
});
</script>

<style scoped>
.update-role-container {
    padding: 24px;
    background: #f0f2f5;
    min-height: 100vh;
}

.back-button {
    margin-bottom: 20px;
    border-radius: 6px;
    height: 35px;
    display: flex;
    align-items: center;
}

.form-card {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
                0 1px 6px -1px rgba(0, 0, 0, 0.02),
                0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.loading-container p {
    margin-top: 16px;
    color: #8c8c8c;
}

:deep(.ant-form-item-label) {
    font-weight: 500;
}

:deep(.ant-input) {
    border-radius: 6px;
}

:deep(.ant-btn) {
    border-radius: 6px;
    height: 35px;
    display: flex;
    align-items: center;
}

:deep(.ant-card-head-title) {
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
}
</style>

 -->
