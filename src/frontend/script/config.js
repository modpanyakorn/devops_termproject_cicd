window.CONFIG = {
  API_URL:
    window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:3000` // ใช้ hostname เดียวกับที่เข้าใช้งานเว็บ
      : "http://localhost:3000",
};
