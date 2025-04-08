const mysql = require("mysql2");
require("dotenv").config(); // โหลดค่าจาก .env

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ตรวจสอบการเชื่อมต่อ
connection.connect((err) => {
  if (err) {
    console.error("❌ ไม่สามารถเชื่อมต่อกับฐานข้อมูล:", err);
    return;
  }
  console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!");
});

module.exports = connection;
