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
import { querySchema, idSchema } from "../validators/queryValidator.js";

const BookRouter = Router();

// Rutas solo para admin
BookRouter.get("/all", checkRole("admin"), validate(querySchema, "query"), getAllBooks);

// Rutas para user y admin
BookRouter.get("/", checkRole("admin", "user"), validate(querySchema, "query"), getBooks);
BookRouter.get("/:id", checkRole("admin", "user"), validate(idSchema, "params"), getBook);
BookRouter.post("/", checkRole("user"), validate(createBookSchema), createBook);
BookRouter.patch("/:id", checkRole("user"), validate(idSchema, "params"), validate(updateBookSchema), updateBook);

// DELETE — admin puede borrar cualquier libro, user solo los suyos
BookRouter.delete("/:id", validate(idSchema, "params"), (req, res, next) => {
  if (req.userLogged.role === "admin") {
    return adminDeleteBook(req, res, next);
  }
  return deleteBook(req, res, next);
});

export { BookRouter };