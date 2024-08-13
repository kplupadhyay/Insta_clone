import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoute from "./routes/userRoutes.js";

dotenv.config({});
const PORT = process.env.PORT || 4500;

const app = express();
//middlewares
app.use(express.json());
app.use(cookieParser());
// app.use(urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true })); // Correct usage
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
  connectDb();
  console.log("connected to server");
});
