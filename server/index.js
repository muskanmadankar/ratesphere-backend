// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import { fileURLToPath } from "url";
// import path from "path";
// import mongoose from "mongoose";

// // Routes
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/users.js";
// import storeRoutes from "./routes/stores.js";
// import ratingRoutes from "./routes/ratings.js";
// import dashboardRoutes from "./routes/dashboard.js";

// // Middleware
// import { authenticateJWT } from "./middleware/auth.js";

// // Init
// dotenv.config();
// console.log("MONGO_URI:", process.env.MONGO_URI);
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Calculate dirname equivalent in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/store_rating_system")
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // CORS Configuration for cross-origin requests
// const allowedOrigins = [
//   "http://localhost:5173", // for local testing
//   "https://bright-brioche-d3290ed.netlify.app", // your deployed frontend
//   "https://register-frontend-dusky.vercel.app"  // if you're testing on Vercel
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Health check route
// app.get("/ping", (req, res) => {
//   res.send("pong");
// });

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", authenticateJWT, userRoutes);
// app.use("/api/stores", authenticateJWT, storeRoutes);
// app.use("/api/ratings", authenticateJWT, ratingRoutes);
// app.use("/api/dashboard", authenticateJWT, dashboardRoutes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// export default app;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import storeRoutes from "./routes/stores.js";
import ratingRoutes from "./routes/ratings.js";
import dashboardRoutes from "./routes/dashboard.js";

// Middleware
import { authenticateJWT } from "./middleware/auth.js";

// Init
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;

// Calculate dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/store_rating_system")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// CORS Configuration for cross-origin requests
const allowedOrigins = [
  "http://localhost:5173", // for local testing
  "https://bright-brioche-d3290ed.netlify.app", // deployed frontend
  "https://register-frontend-dusky.vercel.app"  // optional Vercel test
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// ✅ Safe handling of preflight OPTIONS requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/stores", authenticateJWT, storeRoutes);
app.use("/api/ratings", authenticateJWT, ratingRoutes);
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;