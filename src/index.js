import express from "express";
import usersRouter from "./Modules/Users/users.controller.js";
import messagesRouter from "./Modules/Messages/messages.controller.js";
import databaseConnection from "./DB/database.connection.js";

const PORT = 3000;

const app = express();

// Parsing Middleware
app.use(express.json());

// Handling Routes
app.use("/users", usersRouter);
app.use("/messages", messagesRouter);

// Handling Database Connection
databaseConnection();

// Handling Errors Middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send("Something Broke!");
});

// Not Found Middleware
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
