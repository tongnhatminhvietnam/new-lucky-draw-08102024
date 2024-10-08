const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// Cấu hình bodyParser để xử lý POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình để phục vụ các tệp tĩnh
app.use(express.static(path.join(__dirname)));

// Kết nối cơ sở dữ liệu SQLite
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Lỗi khi mở cơ sở dữ liệu:", err.message);
  } else {
    console.log("Kết nối cơ sở dữ liệu thành công.");
    db.run(`CREATE TABLE IF NOT EXISTS users (
      phone TEXT PRIMARY KEY,
      luckyNumber TEXT
    )`);
  }
});

// Route mặc định trả về trang admin.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Xử lý đăng nhập
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Sai thông tin đăng nhập!" });
  }
});

// Xử lý lưu số điện thoại và số may mắn
app.post("/saveData", (req, res) => {
  const { phone, luckyNumber } = req.body;
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
      res.send("Số điện thoại không có trong danh sách.");
    }
  });
});

// Khởi động server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});

