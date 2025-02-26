import axiosClient from "./axiosClient";

const scheduleApi = {
  getSchedules() {
    return axiosClient.get("/tasks");
  },
  createSchedule(data) {
    return axiosClient.post("/tasks", data);
  },
  deleteSchedule(id) {
    return axiosClient.delete(`/tasks/${id}`);
  }
};

export default scheduleApi;
