import { Router } from "express";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getAllBooks,
  adminDeleteBook,
} from "../controllers/bookControllers.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createBookSchema, updateBookSchema } from "../validators/bookValidator.js";

const BookRouter = Router();

// Rutas solo para admin 
BookRouter.get("/all", checkRole("admin"), getAllBooks);
BookRouter.delete("/all/:id", checkRole("admin"), adminDeleteBook);

// Rutas para user y admin
BookRouter.get("/", checkRole("admin", "user"), getBooks);
BookRouter.get("/:id", checkRole("admin", "user"), getBook);
BookRouter.post("/", checkRole("user"), validate(createBookSchema), createBook);
BookRouter.patch("/:id", checkRole("user"), validate(updateBookSchema), updateBook);
BookRouter.delete("/:id", checkRole("user"), deleteBook);

export { BookRouter };
