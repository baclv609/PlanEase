import { defineStore } from 'pinia';
import axios from 'axios';

export const useUpcomingTasksStore = defineStore('upcomingTasks', {
  state: () => ({
    upcomingTasks: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchUpcomingTasks() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}tasks/upComingTasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response?.data?.code === 200) {
          this.upcomingTasks = response.data.data || [];
        } else {
          throw new Error(response?.data?.message);
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
