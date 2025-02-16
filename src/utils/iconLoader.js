// src/utils/iconLoader.js
const icons = import.meta.glob("@/assets/icon/*.{png,jpg,jpeg,svg}", { eager: true });

const iconMap = Object.keys(icons).reduce((acc, path) => {
  // Lấy tên file, ví dụ: "upload_icon.png"
  const fileName = path.split("/").pop();
  acc[fileName] = icons[path].default;
  return acc;
}, {});

export default iconMap;
