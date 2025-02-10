import axiosClient from "./axiosClient";

const scheduleApi = {
  getSchedules() {
    return axiosClient.get("/schedules");
  },
  createSchedule(data) {
    return axiosClient.post("/schedules", data);
  },
  deleteSchedule(id) {
    return axiosClient.delete(`/schedules/${id}`);
  }
};

export default scheduleApi;
