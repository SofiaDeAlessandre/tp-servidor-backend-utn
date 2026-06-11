import { model, Schema } from "mongoose";

// schema (para crear el modelo)
const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// modelos para utilizar la db
const User = model("User", userSchema);

export { User };
