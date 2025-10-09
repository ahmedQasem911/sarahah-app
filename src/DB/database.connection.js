import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/sarahah-app");
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed: \n", error);
  }
};

export default databaseConnection;
