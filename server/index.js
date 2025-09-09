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
dotenv.config();
// Middleware
import { authenticateJWT } from "./middleware/auth.js";

// Init
dotenv.config();
const app = express();
const PORT = 3000;

// Calculate dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
const allowedOrigins = [
  "http://localhost:5173", // for local testing (Vite default)
  "http://localhost:5176", // for local testing (your current port)
  "http://localhost:5184", // for local testing (alternative port)
  "http://localhost:3000", // for local testing (alternative)
  // "https://bright-brioche-d3290ed.netlify.app", // deployed frontend
  "https://bright-brioche-d3290d.netlify.app/",
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
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/stores", authenticateJWT, storeRoutes);
app.use("/api/ratings", authenticateJWT, ratingRoutes);
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);

// Serve static assets in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
//   });
// }

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
