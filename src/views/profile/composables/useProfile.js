import { ref } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export function useProfile() {
    const completionRate = ref(0)
    const loading = ref(false)
    const error = ref(null)
    const busiestDays = ref([])
    const dirApi = import.meta.env.VITE_API_BASE_URL;

    const fetchCompletionRate = async (startDate = null, endDate = null, taskTimezone = 'Asia/Ho_Chi_Minh') => {
        try {
            loading.value = true
            error.value = null

            const params = {}
            if (startDate && endDate) {
                // Chuyển đổi thời gian từ local timezone sang task timezone
                const localStartDate = dayjs(startDate)
                const localEndDate = dayjs(endDate)
                
                // Lấy offset giữa local timezone và task timezone
                const localOffset = dayjs().tz(dayjs.tz.guess()).utcOffset()
                const taskOffset = dayjs().tz(taskTimezone).utcOffset()
                const offsetDiff = taskOffset - localOffset
                
                // Điều chỉnh thời gian theo offset
                params.start_date = localStartDate.add(offsetDiff, 'minute').format('YYYY-MM-DD')
                params.end_date = localEndDate.add(offsetDiff, 'minute').format('YYYY-MM-DD')
                
                // console.log('Local timezone:', dayjs.tz.guess())
                // console.log('Task timezone:', taskTimezone)
                // console.log('Original dates:', { startDate, endDate })
                // console.log('Adjusted dates:', params)
            }

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

    const fetchBusiestDay = async (startDate = null, endDate = null, taskTimezone = 'Asia/Ho_Chi_Minh') => {
        try {
            loading.value = true
            error.value = null

            const params = {}
            if (startDate && endDate) {
                // Chuyển đổi thời gian từ local timezone sang task timezone
                const localStartDate = dayjs(startDate)
                const localEndDate = dayjs(endDate)
                
                // Lấy offset giữa local timezone và task timezone
                const localOffset = dayjs().tz(dayjs.tz.guess()).utcOffset()
                const taskOffset = dayjs().tz(taskTimezone).utcOffset()
                const offsetDiff = taskOffset - localOffset
                
                // Điều chỉnh thời gian theo offset
                params.start_date = localStartDate.add(offsetDiff, 'minute').format('YYYY-MM-DD')
                params.end_date = localEndDate.add(offsetDiff, 'minute').format('YYYY-MM-DD')
            }

            const response = await axios.get(`${dirApi}stats/busiest-day`, { 
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })
            
            if (response.data.code === 200) {
                busiestDays.value = response.data.data
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
            busiestDays.value = []
        } finally {
            loading.value = false
        }
    }
                    
    return {
        completionRate,
        loading,
        error,
        busiestDays,
        fetchCompletionRate,
        fetchBusiestDay
    }
}
