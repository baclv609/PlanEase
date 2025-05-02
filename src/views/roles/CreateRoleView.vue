<!-- <template>
    <div class="create-role-container">
        <div class="page-header">
            <a-button class="back-button" type="primary" @click="goBack">
                <template #icon>
                    <ArrowLeftOutlined />
                </template>
                Quay lại danh sách
            </a-button>
            <h1 class="page-title">Thêm Role Mới</h1>
        </div>

        <a-card :bordered="false" class="form-card">
            <template #extra>
                <TagsOutlined class="card-icon" />
            </template>

            <a-form
                :model="formState"
                name="createRole"
                @finish="onFinish"
                :rules="rules"
                layout="vertical"
                class="role-form"
            >
                <div class="form-description">
                    <InfoCircleOutlined />
                    <span>Vui lòng nhập thông tin role mới bên dưới</span>
                </div>

                <a-form-item
                    label="Tên Role"
                    name="name"
                    class="form-input"
                >
                    <a-input 
                        v-model:value="formState.name"
                        placeholder="Nhập tên role"
                        :maxLength="255"
                        size="large"
                    >
                        <template #prefix>
                            <UserOutlined class="input-icon" />
                        </template>
                    </a-input>
                    <div class="input-description">
                        Tên role không được vượt quá 255 ký tự
                    </div>
                </a-form-item>

                <div class="form-actions">
                    <a-button 
                        type="primary" 
                        html-type="submit" 
                        :loading="loading"
                        size="large"
                        class="submit-button"
                    >
                        <template #icon><SaveOutlined /></template>
                        <span>Lưu Role</span>
                    </a-button>
                    <a-button 
                        @click="goBack" 
                        size="large"
                        class="cancel-button"
                    >
                        <template #icon><CloseOutlined /></template>
                        <span>Hủy</span>
                    </a-button>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { 
    ArrowLeftOutlined, 
    SaveOutlined, 
    TagsOutlined,
    UserOutlined,
    InfoCircleOutlined,
    CloseOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const dirApi = import.meta.env.VITE_API_BASE_URL;
const loading = ref(false);

const formState = reactive({
    name: ''
});

const rules = {
    name: [
        { required: true, message: 'Vui lòng nhập tên role' },
        { max: 255, message: 'Tên role không được vượt quá 255 ký tự' }
    ]
};

const onFinish = async (values) => {
    loading.value = true;
    try {
        const response = await axios.post(`${dirApi}admin/roles`, { name: values.name },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );
        // console.log('API Response:', response.data);

        if (response.data.code === 200) {
            message.success('Thêm role thành công');
            router.push('/dashboard/roles');
        } else {
            message.error(response.data.message || 'Có lỗi xảy ra khi thêm role');
        }
    } catch (error) {
        console.error('Error detail:', error.response || error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error('Có lỗi xảy ra khi tạo role');
        }
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push('/dashboard/roles');
};
</script>

<style scoped>
.create-role-container {
    padding: 24px;
    background: #f5f7fa;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f1f1f;
}

.back-button {
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
}

.back-button :deep(.anticon) {
    font-size: 16px;
    display: flex;
    align-items: center;
}

.form-card {
    max-width: 700px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon {
    font-size: 20px;
    color: #1890ff;
}

.role-form {
    padding: 20px 0;
}

.form-description {
    margin-bottom: 24px;
    padding: 16px;
    background: #e6f7ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0050b3;
}

.form-input {
    margin-bottom: 24px;
}

.input-icon {
    color: #bfbfbf;
}

.input-description {
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c8c;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
}

.submit-button,
.cancel-button {
    min-width: 120px;
    height: 40px;
    border-radius: 8px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.submit-button :deep(.anticon),
.cancel-button :deep(.anticon) {
    font-size: 16px;
    display: flex;
    align-items: center;
}

:deep(.ant-form-item-label) {
    font-weight: 500;
    font-size: 15px;
}

:deep(.ant-input-affix-wrapper) {
    border-radius: 8px;
    padding: 8px 12px;
}

:deep(.ant-input) {
    font-size: 15px;
}

:deep(.ant-card-head) {
    min-height: 60px;
    border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-card-head-title) {
    font-size: 18px;
    font-weight: 600;
    color: #1f1f1f;
}

:deep(.ant-form-item-explain-error) {
    margin-top: 4px;
    font-size: 13px;
}
</style> -->