import { model, Schema } from "mongoose";

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    genre: { type: String, default: "Sin género" },
    pages: { type: Number, default: 0 },
    read: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Book = model("Book", bookSchema);

export { Book };
