import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);

    // Stop the application if database fails
    process.exit(1);
  }
};

export default databaseConnection;
