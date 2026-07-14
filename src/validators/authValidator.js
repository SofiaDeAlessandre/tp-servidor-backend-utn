import { z } from "zod";

// Schema para registro
const registerSchema = z.object({
  username: z.string().min(1, "El username es requerido"),
  email: z.string().email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])/,
      "La contraseña debe tener al menos una mayúscula, un número y un carácter especial"
    ),
});

// Schema para login
const loginSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export { registerSchema, loginSchema };