import { connect } from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI: string = process.env.MONGOURI ?? process.env.APPSETTING_MONGOURI;
    await connect(mongoURI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
