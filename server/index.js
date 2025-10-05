import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/Todo.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;


app.use(express.json()); 
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);

app.use("/api/todos", todoRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});


app.get("/", (req, res) => {
    res.json({ message: "Todo Tracker API is running" });
});


console.log("Loaded MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    })
    .catch((err) => console.error("MongoDB connection error:", err));
