import { z } from "zod";

// Schema para crear un libro
const createBookSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  price: z.number().min(0, "El precio no puede ser negativo").default(0),
  genre: z.string().default("Sin género"),
  pages: z.number().min(1, "Las páginas deben ser mayor a 0").default(0),
  read: z.boolean().default(false),
});

// Schema para actualizar un libro (todos los campos opcionales)
const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  genre: z.string().optional(),
  pages: z.number().min(1).optional(),
  read: z.boolean().optional(),
});

export { createBookSchema, updateBookSchema };