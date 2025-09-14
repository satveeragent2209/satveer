const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS + JSON
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Store latest data in a JSON file
const DATA_FILE = "data.json";
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "latest" + ext);
  },
});
const upload = multer({ storage });

// API to upload text + image
app.post("/upload", upload.single("image"), (req, res) => {
  const { punjabi, hindi, english } = req.body;

  const fileUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;

  const latestData = { punjabi, hindi, english, image: fileUrl };

  fs.writeFileSync(DATA_FILE, JSON.stringify(latestData));

  res.json({ success: true, ...latestData });
});

// API to fetch latest data
app.get("/latest", (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
  } else {
    res.json({});
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
