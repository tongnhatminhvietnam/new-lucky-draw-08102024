const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express(); 

// Cấu hình bodyParser để xử lý POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình đường dẫn tĩnh cho các tệp HTML trong thư mục public
app.use(express.static(path.join(__dirname, "public")));

// Tạo hoặc mở cơ sở dữ liệu SQLite
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error("Lỗi khi mở cơ sở dữ liệu:", err.message);
  } else {
    console.log("Kết nối cơ sở dữ liệu SQLite thành công.");
  }
});

// Tạo bảng nếu chưa có
db.run(`CREATE TABLE IF NOT EXISTS users (
  phone TEXT PRIMARY KEY,
  luckyNumber TEXT
)`);

// Route mặc định trả về trang admin.html khi truy cập URL gốc "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Xử lý lưu số điện thoại và số may mắn
app.post("/saveData", (req, res) => {
  const phone = req.body.phone;
  const luckyNumber = req.body.luckyNumber;

  if (!phone || !luckyNumber) {
    return res.status(400).send("Dữ liệu không hợp lệ!");
  }

  db.run(`INSERT OR REPLACE INTO users (phone, luckyNumber) VALUES (?, ?)`, [phone, luckyNumber], (err) => {
    if (err) {
      return res.status(500).send("Lỗi khi lưu số liệu!");
    }
    res.send("Lưu số liệu thành công!");
  });
});

// Xử lý tra cứu số may mắn
app.post("/getLuckyNumber", (req, res) => {
  const phone = req.body.phone.trim();

  db.get("SELECT luckyNumber FROM users WHERE phone = ?", [phone], (err, row) => {
    if (err) {
      return res.status(500).send("Lỗi cơ sở dữ liệu!");
    }
    if (row) {
      res.send(`Số may mắn của bạn là: ${row.luckyNumber}`);
    } else {
      res.send("Số điện thoại của bạn không có trong danh sách khách mời, liên hệ anh Tống Nhật Minh để được hỗ trợ.");
    }
  });
});

// Khởi động server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
