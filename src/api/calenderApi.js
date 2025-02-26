import axiosClient from "./axiosClient";

const calenderApi = {
    getSchedules() {
        return axiosClient.get("/schedules");
    },
    createSchedule(data) {
        return axiosClient.post("/schedules", data);
    }
};

export default calenderApi;