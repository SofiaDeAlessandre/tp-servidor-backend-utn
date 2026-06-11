import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import cors from "cors";
import { connect, model, Schema } from "mongoose";

// Conexión a Base de Datos
const connectDb = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDb");
  } catch (error) {
    console.log("❌ Error al conectarse a MongoDb", error.message);
  }
};

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

const server = express();

server.use(cors());
server.use(express.json()); // Permite que las peticiones puedan enviar body JSON

const PORT = process.env.PORT;

// Middlewares

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  },
});

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userLogged = decoded;

    next();
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

// Status

server.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API REST con Express y MongoDB",
  });
});

// ----- Libros -----
// Obtener TODOS los libros

server.get("/api/books", authMiddleware, async (req, res) => {
  try {
    const userLogged = req.userLogged;
    const filterBooks = await Book.find({ userId: userLogged.id });
    res.json({
      success: true,
      data: filterBooks,
      message: "Books fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching books" });
  }
});

// Obtener UN libro por su ID

server.get("/api/books/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Protección por usuario:
// Verifica que el libro pertenezca al usuario autenticado
    const foundBook = await Book.findOne({
      _id: id,
      userId: req.userLogged.id,
    });

    if (!foundBook) {
      return res.status(404).json({
        success: false,
        error: "Book not found",
      });
    }

    res.json({
      success: true,
      data: foundBook,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }
});

// Agregar un libro

server.post("/api/books", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const userLogged = req.userLogged;

    const newBook = await Book.create({
      title: body.title,
      price: body.price,
      genre: body.genre,
      pages: body.pages,
      read: body.read ?? false, // read no debe depender de pages, el usuario decide si lo leyó
      userId: userLogged.id,
    });

    const publicDataBook = {
      id: newBook._id,
      title: newBook.title,
      price: newBook.price,
      genre: newBook.genre,
      pages: newBook.pages,
      read: newBook.read,
      createdAt: newBook.createdAt,
      updatedAt: newBook.updatedAt,
    };

    res.json({
      success: true,
      data: publicDataBook,
      message: "Book created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating book" });
  }
});

// Actualizar un libro por ID

server.patch("/api/books/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

 // Solo permite modificar libros creados por el usuario autenticado
const updatedBook = await Book.findOneAndUpdate(
  {
    _id: id,
    userId: req.userLogged.id,
  },
  body,
  { new: true }
); // pasando body directamente, el usuario manda exactamente lo que quiere actualizar (read es una decisión del usuario, no una consecuencia de otro campo)

    if (!updatedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({
      success: true,
      data: updatedBook,
      message: "Book updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" });
  }
});

// Eliminar UN libro por su ID

server.delete("/api/books/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

 // Solo permite eliminar libros asociados al usuario autenticado
const deletedBook = await Book.findOneAndDelete({
  _id: id,
  userId: req.userLogged.id,
});

    if (!deletedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({
      success: true,
      data: deletedBook,
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" });
  }
});

// ----- Usuarios -----
// Registro

server.post("/api/auth/register", async (req, res) => {
  try {
    const { body } = req;
    const { password, username, email } = body;

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      return res
        .status(409)
        .json({ success: false, error: "Conflict, user already exists" });
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;
    if (!regex.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid password. It must contain at least 8 characters, one uppercase letter, one number, and one special character.",
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
    });

    const publicDataUser = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.json({
      success: true,
      data: publicDataUser,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error registering user" });
  }
});

// Login

server.post("/api/auth/login", limiter, async (req, res) => {
  // limiter → middleware local (en este caso)
  try {
    const { body } = req;

    const { email, password } = body;

    if (!email || !password) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);

    if (!isValid) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // TOKEN JWT → Json Web Token

    const payload = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
    };
    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    res.json({ success: true, data: { token }, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error logging in" });
  }
});

// Servidor en escucha en el puerto seleccionado

server.listen(PORT, () => {
  connectDb();
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`);
});
