import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is missing or undefined. Please set MONGO_URI in environment variables."
      );
    }

    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

    logger.info(
      `MongoDB connected || DB NAME: ${connectionInstance.connection.name}`
    );

    logger.info(`DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error({
      message: "Error connecting to MongoDB",
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

export default connectDB;
