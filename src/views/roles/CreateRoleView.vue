<template>
    <div class="create-role-container">
        <a-button class="back-button" type="primary" ghost @click="goBack">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Quay lại danh sách
        </a-button>

        <a-card title="Thêm Role Mới" :bordered="false" class="form-card">
            <a-form
                :model="formState"
                name="createRole"
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
                            :loading="loading"
                        >
                            <template #icon><SaveOutlined /></template>
                            Lưu
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons-vue';

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
            router.push('/roles');
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
    router.push('/roles');
};
</script>

<style scoped>
.create-role-container {
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