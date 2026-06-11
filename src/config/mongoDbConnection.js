import { connect } from "mongoose";

const connectDb = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDb");
  } catch (error) {
    console.log("❌ Error al conectarse a MongoDb", error.message);
  }
};

export { connectDb };
