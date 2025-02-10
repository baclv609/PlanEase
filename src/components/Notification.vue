<template>
    <div>
      <h1>Ứng dụng Thông Báo</h1>
      
      <!-- Nút để hiển thị thông báo -->
      <button @click="sendNotification">Gửi Thông Báo</button>
  
      <!-- Hiển thị thông báo trong giao diện Vue -->
      <div v-if="notification" class="notification">
        <p>{{ notification }}</p>
        <button @click="closeNotification">Đóng</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        notification: null,  // Lưu thông báo đang hiển thị
      };
    },
    methods: {
      // Hàm gửi thông báo trình duyệt
      sendNotification() {
        // Kiểm tra quyền gửi thông báo
        if (Notification.permission === "granted") {
          // Hiển thị thông báo trên trình duyệt
          new Notification("Thông báo từ Vue.js!", {
            body: "Đây là một thông báo ví dụ",
            icon: "https://via.placeholder.com/150", // Icon (tuỳ chọn)
          });
        } else if (Notification.permission !== "denied") {
          // Nếu chưa cấp quyền, yêu cầu quyền
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Thông báo từ Vue.js!", {
                body: "Đây là một thông báo ví dụ",
                icon: "https://via.placeholder.com/150",
              });
            }
          });
        }
        
        // Hiển thị thông báo trong giao diện Vue
        this.notification = "Thông báo đã được gửi!";
        
        // Tự động đóng thông báo trong Vue sau 5 giây
        setTimeout(() => {
          this.closeNotification();
        }, 5000);
      },
  
      // Hàm đóng thông báo trong Vue
      closeNotification() {
        this.notification = null;
      },
    },
  };
  </script>
  
  <style scoped>
  #app {
    text-align: center;
    padding: 50px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .notification {
    background-color: #4caf50;
    color: white;
    padding: 20px;
    margin-top: 20px;
    border-radius: 5px;
  }
  </style>
  