import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/mongoDbConnection.js"
import { AuthRouter } from "./routes/authRouter.js";
import { BookRouter } from "./routes/bookRouter.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const server = express();

server.use(cors());
server.use(express.json());

const PORT = process.env.PORT;

// Status
server.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API REST con Express y MongoDB",
  });
});

// Rutas públicas
server.use("/api/auth", AuthRouter);

// Middleware de autenticación → protege todo lo que viene después
server.use(authMiddleware);

// Rutas protegidas
server.use("/api/books", BookRouter);

// Servidor en escucha en el puerto seleccionado
server.listen(PORT, () => {
  connectDb();
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`);
});

export { server };
