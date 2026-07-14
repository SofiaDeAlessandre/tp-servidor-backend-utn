import { z } from "zod";

// Schema para query params opcionales

// z.coerce.number() convierte el string que viene del query param a número automáticamente
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("asc"),
  filter: z.string().optional(),
});

// Schema para validar el id de MongoDB
const idSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ID format"),
});

export { querySchema, idSchema };