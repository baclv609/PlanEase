import axios from "axios";

const API_BASE_URL = "/api/tags";

// Lấy danh sách tags
export const getTags = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tags:", error);
    throw error;
  }
};

// Thêm mới tag
export const createTag = async (tagData) => {
  try {
    const response = await axios.post(API_BASE_URL, tagData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm tag mới:", error);
    throw error;
  }
};
