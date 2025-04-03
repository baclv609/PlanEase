import { ref } from 'vue'
import axios from 'axios'

export function useProfile() {
    const completionRate = ref(0)
    const loading = ref(false)
    const error = ref(null)
    const dirApi = import.meta.env.VITE_API_BASE_URL;


    const fetchCompletionRate = async (startDate = null, endDate = null) => {
        try {
            loading.value = true
            error.value = null

            const params = {}
            if (startDate) params.start_date = startDate
            if (endDate) params.end_date = endDate

            const response = await axios.get(`${dirApi}stats/completion-rate`, { 
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })
            
            if (response.data.code === 200) {
                completionRate.value = response.data.data.completion_rate
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu')
            }
        } catch (err) {
            console.error('Error details:', {
                response: err.response?.data,
                status: err.response?.status,
                message: err.message
            })
            error.value = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu'
            completionRate.value = 0
        } finally {
            loading.value = false
        }
    }

    return {
        completionRate,
        loading,
        error,
        fetchCompletionRate
    }
}
