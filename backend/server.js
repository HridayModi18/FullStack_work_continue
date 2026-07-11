require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const passport = require("./config/passport");
const sequelize = require("./config/db");
require("./models");

const authRoutes = require("./routes/authRoutes");
const bootcampRoutes = require("./routes/bootcampRoutes");
const auditRoutes = require("./routes/auditRoutes");
const userRoutes = require("./routes/userRoutes");
const doubtRoutes = require("./routes/doubtRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", //allowing both frontend , filhaal local pe he , baad me deploy kr dunga
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//io accesible in both routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected via socket:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// If someone goes to http://localhost:5000/uploads/photos/photo.jpg, express apna uploads folder dekhega
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/studentuploads",
  express.static(path.join(__dirname, "studentuploads")),
);

app.use("/auth", authRoutes);
app.use("/api/bootcamp", bootcampRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/notifications", notificationRoutes);

// just testing
app.get("/", (req, res) => {
  res.json({ message: " working " });
});

const PORT = process.env.PORT || 5000; // abhi ke liuye local pe rkh rha , baad me env se le lenge

sequelize
  .query("ALTER TABLE Notifications MODIFY type VARCHAR(255) NOT NULL DEFAULT 'general'")
  .catch(() => console.log("Notification table might not exist yet, skipping alter"))
  .then(() => sequelize.query("ALTER TABLE Doubts ADD COLUMN isPublic BOOLEAN DEFAULT true"))
  .catch(() => console.log("Doubts.isPublic might already exist, skipping alter"))
  .then(() => sequelize.sync())
  .then(() => {
    console.log("dbms connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("error:", err.message);
  });
