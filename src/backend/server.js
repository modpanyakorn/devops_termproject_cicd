require("dotenv").config();
const listEndpoints = require("express-list-endpoints");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");
const { autoExpireRequests } = require("./auto_status_expired");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: ["http://localhost:5501", "http://localhost:3000"],
    credentials: true,
  },
});
//Auto update status
cron.schedule("*/30 * * * * *", async () => {
  //ปรับเวลาตรงนี้นะ :)
  console.log("⏰ Running autoExpireRequests...");
  await autoExpireRequests();
});

// Middleware
app.use(
  cors({
    // ยอมรับทั้ง localhost และ domain อื่นๆ
    origin: function (origin, callback) {
      // ยอมรับทั้งในกรณี origin ไม่ถูกส่งมา (เช่น Postman) และใน production
      const allowedOrigins = [
        "http://localhost:5501",
        "http://localhost:3000",
        "http://localhost:8080",
      ];

      // ถ้าเป็น production จะมี origin เช่น http://EC2_IP_ADDRESS
      // ถ้า origin ไม่มี หรือ เป็น origin ที่ยอมรับ หรือ ไม่ใช่ localhost
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        !origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      // maxAge: 3600000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// โฟลเดอร์เก็บรูป
const uploadDir = path.join(__dirname, "./storage/equipment_img");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// ให้ Express ให้บริการไฟล์รูปแบบ Static
app.use("/storage/equipment_img", express.static(uploadDir));

// Routes
app.use("/auth", require("./core/auth/auth.routes"));
app.use("/booker", require("./modules/booker/booker.routes"));

// list endpoints
console.log("📚 API Endpoints:");
console.table(listEndpoints(app));

// Socket.IO events
io.on("connection", (socket) => {
  console.log("📡 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Start server
const HOST = process.env.API_HOST || "0.0.0.0";
const PORT = process.env.API_PORT || 3000;

// เพิ่ม logging เพื่อ debug
console.log(`API_HOST: ${process.env.API_HOST}`);
console.log(`API_PORT: ${process.env.API_PORT}`);
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});
