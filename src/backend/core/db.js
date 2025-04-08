const mysql = require("mysql2");
require("dotenv").config();

// สร้างฟังก์ชันสำหรับลองเชื่อมต่อซ้ำ
const createConnection = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "mysql",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  // จัดการเหตุการณ์เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
  connection.on("error", (err) => {
    console.error("Database connection error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log(
        "⚠️ การเชื่อมต่อกับฐานข้อมูลหายไป กำลังพยายามเชื่อมต่อใหม่..."
      );
      // ลองเชื่อมต่อใหม่อีกครั้ง
      setTimeout(handleDisconnect, 2000);
    } else {
      throw err;
    }
  });

  return connection;
};

// ฟังก์ชันจัดการการเชื่อมต่อที่หลุด
const handleDisconnect = () => {
  connection = createConnection();

  connection.connect((err) => {
    if (err) {
      console.error("⚠️ ไม่สามารถเชื่อมต่อกับฐานข้อมูล:", err);
      // ลองเชื่อมต่อใหม่อีกครั้งหลังจาก 2 วินาที
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!");
    }
  });
};

// สร้างการเชื่อมต่อครั้งแรก
let connection = createConnection();

// เริ่มต้นการเชื่อมต่อ
handleDisconnect();

module.exports = connection;
