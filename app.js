import 'dotenv/config';
import express from "express";
import bcrypt, { hash } from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import jwt from "jsonwebtoken";
import { connect, model, Schema } from 'mongoose';

//------------------------------------------- Array de productos 

// const products = [
//   {
//     id: 1,
//     name: "Tablet Samsung Galaxy Tab A9",
//     price: 320000,
//     category: "Tablets",
//     stock: 14,
//     available: true,
//   },
//   {
//     id: 2,
//     name: "Smart TV LG 50 pulgadas 4K",
//     price: 780000,
//     category: "Televisores",
//     stock: 6,
//     available: true,
//   },
//   {
//     id: 3,
//     name: "Parlante Bluetooth Sony SRS-XB13",
//     price: 89000,
//     category: "Audio",
//     stock: 20,
//     available: true,
//   },
//   {
//     id: 4,
//     name: "Router TP-Link Archer C6",
//     price: 67000,
//     category: "Redes",
//     stock: 11,
//     available: true,
//   },
//   {
//     id: 5,
//     name: "Cámara de Seguridad Xiaomi Mi Home",
//     price: 125000,
//     category: "Seguridad",
//     stock: 0,
//     available: false,
//   },
//   {
//     id: 6,
//     name: "Smartwatch Amazfit Bip 5",
//     price: 145000,
//     category: "Wearables",
//     stock: 18,
//     available: true,
//   },
//   {
//     id: 7,
//     name: "Impresora HP DeskJet 2875",
//     price: 159000,
//     category: "Periféricos",
//     stock: 4,
//     available: true,
//   },
//   {
//     id: 8,
//     name: "Consola Xbox Series S",
//     price: 690000,
//     category: "Gaming",
//     stock: 3,
//     available: true,
//   },
// ];

 // Array de Usuarios

// const users = []

// --------------------------------------------------------------------ARRAYS FIN

// ----------------------------------------------------------------- NUEVO MONGODB

// Conexión a Base de Datos 

const connectDb = async () => {
  try {
    await connect(process.env.MONGODB_URI)
    console.log("✅ Conectado a MongoDb")
  } catch (error) {
    console.log("❌ Error al conectarse a MongoDb", error.message)
  }
}

// schema (para crear el módelo)
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  versionKey: false,
  timestamps: true
})

// modelos para utilizar la db
const User = model("User", userSchema)

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String, default: "Sin categoria" },
  stock: { type: Number, default: 0 },
  available: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
  versionKey: false,
  timestamps: true
})

const Product = model("Product", productSchema)
// -----------------------------------------------------  FIN MONGODB

const server = express();

server.use(express.json()); // Permite que las peticiones puedan enviar body JSON

const PORT = process.env.PORT;

// Middleware
// Middleware global → aplica a todas las request → server.use(limiter)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 5, 

  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests, please try again later." })
  }
})

// --------------------NUEVO

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userLogged = decoded

    next()
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}


// ----------------------------------

// Status

server.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API REST con Express y MongoDB"
  })
})

// Obtener TODOS los productos

server.get("/products", authMiddleware, async (req, res) => {
   try {
    const userLogged = req.userLogged
    const filterProducts = await Product.find({ userId: userLogged.id })
    res.json({
      success: true,
      data: filterProducts,
      message: "Producst fetched successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching products" })
  }
})

// Obtener UN producto por su ID

server.get("/products/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const foundProduct = await Product.findById(id);
        if (!foundProduct) return res.status(404).json({ error: "Not found" }); // Le agregué return al if para que corte la ejecución cuando no encuentra el producto
    res.json(foundProduct)
    } catch (error) {
    res.status(400).json({ error: "Invalid ID format" })
  }
});

// Agregar un producto

server.post("/products", authMiddleware, async (req, res) => {
  try {
    const body = req.body
    const userLogged = req.userLogged

    const newProduct = await Product.create({
      name: body.name,
      price: body.price,
      category: body.category,
      stock: body.stock,
      available: body.stock > 0,
      userId: userLogged.id
    })

    newProduct.save()

    const publicDataProduct = {
      id: newProduct._id,
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category,
      stock: newProduct.stock,
      available: newProduct.available,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt
    }

    res.json({
      success: true,
      data: publicDataProduct,
      message: "Product created successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating product" })
  }
})

// Actualizar un producto por ID

server.put("/products/:id", authMiddleware, async (req, res) => {
    try {
const { id } = req.params
  const body = req.body

  const updatedProduct = await Product.findByIdAndUpdate(id, { ...body, available: body.stock > 0 }, { new: true })
    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: "Product not found" })
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    })
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" })
  }
})

// Eliminar UN producto por su ID

server.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const deletedProduct = await Product.findByIdAndDelete(id)

    if (!deletedProduct) {
      return res.status(404).json({ success: false, error: "Product not found" })
    }

    res.json({ success: true, data: deletedProduct, message: "Product deleted successfully" })
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" })
  }
})

// ---------------------------- Usuarios
// Registro

server.post("/auth/register", async (req, res) => {
  try {
    const { body } = req
    const { password, username, email } = body

    const foundUser = await User.findOne({ email })

    if (foundUser) {
      return res.status(409).json({ success: false, error: "Conflict, user already exists" })
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/
    if (!regex.test(password)) {
      return res.status(400).json({ success: false, error: "Invalid password. It must contain at least 8 characters, one uppercase letter, one number, and one special character." })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
    })

    newUser.save()

    const publicDataUser = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    res.json({
      success: true,
      data: publicDataUser,
      message: "User registered successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error registering user" })
  }
})

// Login

server.post("/auth/login", limiter, async (req, res) => { // limiter → middleware local (en este caso)
   try {
    const { body } = req

    const { email, password } = body

    if (!email || !password) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const foundUser = await User.findOne({ email })

    if (!foundUser) {
      return res.status(403).json({ success: false, error: "Unauthorized" })
    }

    const isValid = await bcrypt.compare(password, foundUser.password)

    if (!isValid) {
      return res.status(403).json({ success: false, error: "Unauthorized" })
    }


  // TOKEN JWT → Json Web Token → string

    const payload = { id: foundUser._id, username: foundUser.username, email: foundUser.email }
    const secretKey = process.env.JWT_SECRET

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" })

    res.json({ success: true, data: { token }, message: "Login successful" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error logging in" })
  }
})


// Servidor en escucha en el puerto seleccionado

server.listen(PORT, () => {
  connectDb()
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})
