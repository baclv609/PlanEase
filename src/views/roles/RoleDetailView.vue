<template>
    <div class="page-container">
        <div class="header-section">
            <a-button class="back-button" type="primary" ghost @click="goBack">
                <template #icon><ArrowLeftOutlined /></template>
                Quay lại danh sách
            </a-button>
            <div class="header-title">
                <SafetyCertificateOutlined class="header-icon" />
                <span>Chi tiết vai trò</span>
            </div>
        </div>

        <div class="role-detail">
            <a-card :bordered="false" class="custom-card info-card">
                <template #title>
                    <div class="card-header">
                        <InfoCircleOutlined />
                        <span>Thông tin cơ bản</span>
                    </div>
                </template>

                <div v-if="role" class="role-info">
                    <div class="info-item">
                        <div class="info-label">
                            <UserOutlined />
                            <span>Tên vai trò</span>
                        </div>
                        <div class="info-content">
                            <span class="role-name">{{ role.name }}</span>
                        </div>
                    </div>

                    <a-divider />

                    <div class="info-item">
                        <div class="info-label">
                            <CalendarOutlined />
                            <span>Ngày tạo</span>
                        </div>
                        <div class="info-content">
                            <a-tag color="blue">
                                <ClockCircleOutlined />
                                {{ formatDate(role.created_at) || 'Chưa có thông tin' }}
                            </a-tag>
                        </div>
                    </div>

                    <a-divider />

                    <div class="info-item">
                        <div class="info-label">
                            <CheckCircleOutlined />
                            <span>Trạng thái</span>
                        </div>
                        <div class="info-content">
                            <a-badge 
                                :status="role.deleted_at ? 'error' : 'success'"
                                :text="role.deleted_at ? 'Khóa' : 'Hoạt động'"
                            />
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
import { ArrowLeftOutlined, SafetyCertificateOutlined, InfoCircleOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, PieChartOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { Card as ACard, Spin as ASpin, Tag as ATag, Divider as ADivider, Row as ARow, Col as ACol, Statistic as AStatistic, Badge as ABadge } from 'ant-design-vue';
import dayjs from 'dayjs';

const dirApi = import.meta.env.VITE_API_BASE_URL;


export default {
    name: 'RoleDetailView',
    components: {
        ArrowLeftOutlined,
        SafetyCertificateOutlined,
        InfoCircleOutlined,
        UserOutlined,
        CalendarOutlined,
        ClockCircleOutlined,
        CheckCircleOutlined,
        PieChartOutlined,
        TeamOutlined,
        ACard,
        ASpin,
        ATag,
        ADivider,
        ARow,
        ACol,
        AStatistic,
        ABadge
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
        formatDate(date) {
            return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
        },
        goBack() {
            this.$router.push('/dashboard/roles')
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

.header-section {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
}

.back-button {
    border-radius: 8px;
    height: 40px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    
    &:hover {
        transform: translateX(-5px);
    }
}

.header-title {
    font-size: 24px;
    font-weight: 600;
    color: #1890ff;
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-icon {
    font-size: 28px;
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
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1f1f1f;
}

.role-info {
    padding: 16px 0;
}

.info-item {
    display: flex;
    margin: 16px 0;
    align-items: center;
    padding: 0 16px;
}

.info-label {
    width: 150px;
    color: #8c8c8c;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-content {
    flex: 1;
    font-size: 15px;
}

.role-name {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
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
    margin: 16px 0;
}

:deep(.ant-tag) {
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 13px;
}

:deep(.ant-badge-status) {
    display: flex;
    align-items: center;
    gap: 8px;
}

:deep(.ant-badge-status-dot) {
    width: 8px;
    height: 8px;
}

:deep(.ant-badge-status-text) {
    font-size: 14px;
    font-weight: 500;
}
</style>