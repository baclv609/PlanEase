<template>
    <div class="page-container">
        <a-button class="back-button" type="primary" ghost @click="goBack">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Quay lại danh sách
        </a-button>

        <div class="role-detail">
            <a-card :bordered="false" class="custom-card">
                <template #title>
                    <div class="card-header">
                        <h2>Chi tiết vai trò</h2>
                    </div>
                </template>

                <div v-if="role" class="role-info">
                    <div class="info-item">
                        <div class="info-label">Tên vai trò</div>
                        <div class="info-content">{{ role.name }}</div>
                    </div>

                    <a-divider />

                    <div class="info-item">
                        <div class="info-label">Ngày tạo</div>
                        <div class="info-content">{{ role.created_at || 'Chưa có thông tin' }}</div>
                    </div>

                    <a-divider />

                    <div class="info-item">
                        <div class="info-label">Trạng thái</div>
                        <div class="info-content">

                            <a-tag :color="role.deleted_at ? 'pink' : 'green'">
                                {{ role.deleted_at ? 'Không hoạt động' : 'Đang hoạt động' }}
                            </a-tag>
                        </div>
                    </div>
                </div>

                <div v-else class="loading-state">
                    <a-spin size="large" />
                    <p>Đang tải thông tin...</p>
                </div>
            </a-card>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { Card as ACard, Spin as ASpin, Tag as ATag, Divider as ADivider } from 'ant-design-vue';

const dirApi = import.meta.env.VITE_API_BASE_URL;


export default {
    name: 'RoleDetailView',
    components: {
        ArrowLeftOutlined,
        ACard,
        ASpin,
        ATag,
        ADivider
    },
    data() {
        return {
            role: null
        }
    },
    created() {
        this.fetchRoleDetail()
    },
    methods: {
        goBack() {
            this.$router.push('/roles')
        },
        async fetchRoleDetail() {
            try {
                const roleId = this.$route.params.id
                console.log('Role ID:', roleId) 

                const response = await axios.get(`${dirApi}admin/roles/${roleId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                })
                // console.log('API Response:', response.data) 

                if (response.data.code === 200) {
                    this.role = response.data.data
                } else {
                    console.error('Lỗi:', response.data.message)
                }
            } catch (error) {
                console.error('Lỗi khi tải thông tin vai trò:', error)
            }
        }
    }
}
</script>

<style scoped>
.page-container {
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

.role-detail {
    max-width: 800px;
    margin: 0 auto;
}

.custom-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 
                0 1px 6px -1px rgba(0, 0, 0, 0.02), 
                0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.card-header {
    margin-bottom: 0;
}

.card-header h2 {
    margin: 0;
    color: #1890ff;
    font-size: 20px;
    font-weight: 600;
}

.role-info {
    padding: 16px 0;
}

.info-item {
    display: flex;
    margin: 16px 0;
    align-items: center;
}

.info-label {
    width: 150px;
    color: #8c8c8c;
    font-weight: 500;
    font-size: 14px;
}

.info-content {
    flex: 1;
    color: #262626;
    font-size: 15px;
    font-weight: 500;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.loading-state p {
    margin-top: 16px;
    color: #8c8c8c;
}

:deep(.ant-divider) {
    margin: 12px 0;
}

:deep(.ant-tag) {
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
}
</style>