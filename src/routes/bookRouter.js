import { Router } from "express";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookControllers.js";

const BookRouter = Router();

BookRouter.get("/", getBooks);
BookRouter.get("/:id", getBook);
BookRouter.post("/", createBook);
BookRouter.patch("/:id", updateBook);
BookRouter.delete("/:id", deleteBook);

export { BookRouter };
