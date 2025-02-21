import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connect_db = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${db_name}`
    );
    // console.log(`DATABASE CONNECTED: ${connectionInstance}`);
    console.log(`DATABASE CONNECTED: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("DATABASE CONNECTION ERROR: ", error);
    process.exit(1);
  }
};

export default connect_db;
