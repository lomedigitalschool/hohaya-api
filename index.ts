import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Routes Import
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import propertyRoutes from "./routes/properties.routes";
import visitRoutes from "./routes/visits.routes";
import transactionRoutes from "./routes/transactions.routes";

const app = express();
const PORT = 5000;

// Add express built-in body-parser middleware
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 300,
  }),
);

app.use(
  express.json({
    limit: "100mb",
  }),
);

// Add CORS middleware
app.use(
  cors({
    origin: `http://localhost:${PORT}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-API-KEY",
      "X-Session-ID",
    ],
    exposedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
  }),
);

// MongoDb connection
mongoose
  .connect(
    "mongodb+srv://hohaya-api:XcE6QOOxZJ1pP9YV@hohaya-api.gaoewgr.mongodb.net/",
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err: Error) => {
    console.log("Connexion failed :", err);
  });

// Define a simple route
app.get("/", (req: Request, res: Response) => {
  console.log("Request GET received at /");
  res.json({
    success: true,
    message: "Hello World! from the backend",
  });
});

// Users Routes
app.use("/users", userRoutes);

// Properties routes
app.use("/properties", propertyRoutes);

// Auth login, register and Token Generating
app.use("/auth", authRoutes);

// Visits routes
app.use("/visits", visitRoutes);

// Transactions routes
app.use("/transactions", transactionRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
