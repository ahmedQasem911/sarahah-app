import express from "express";
import dotenv from "dotenv";
import databaseConnection from "./DB/database.connection.js";
import usersRouter from "./Modules/Users/users.controller.js";
import messagesRouter from "./Modules/Messages/messages.controller.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

databaseConnection();

const app = express();

app.use(express.json());

// Routes
app.use("/users", usersRouter);
app.use("/messages", messagesRouter);

// Not Found Middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.message);

  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
