import express from "express";
import bcrypt, { hash } from 'bcryptjs';
import { rateLimit } from 'express-rate-limit'
import jwt from "jsonwebtoken"

// Array de productos

const products = [
  {
    id: 1,
    name: "Tablet Samsung Galaxy Tab A9",
    price: 320000,
    category: "Tablets",
    stock: 14,
    available: true,
  },
  {
    id: 2,
    name: "Smart TV LG 50 pulgadas 4K",
    price: 780000,
    category: "Televisores",
    stock: 6,
    available: true,
  },
  {
    id: 3,
    name: "Parlante Bluetooth Sony SRS-XB13",
    price: 89000,
    category: "Audio",
    stock: 20,
    available: true,
  },
  {
    id: 4,
    name: "Router TP-Link Archer C6",
    price: 67000,
    category: "Redes",
    stock: 11,
    available: true,
  },
  {
    id: 5,
    name: "Cámara de Seguridad Xiaomi Mi Home",
    price: 125000,
    category: "Seguridad",
    stock: 0,
    available: false,
  },
  {
    id: 6,
    name: "Smartwatch Amazfit Bip 5",
    price: 145000,
    category: "Wearables",
    stock: 18,
    available: true,
  },
  {
    id: 7,
    name: "Impresora HP DeskJet 2875",
    price: 159000,
    category: "Periféricos",
    stock: 4,
    available: true,
  },
  {
    id: 8,
    name: "Consola Xbox Series S",
    price: 690000,
    category: "Gaming",
    stock: 3,
    available: true,
  },
];

// Array de Usuarios

const users = []


const server = express();

server.use(express.json()); // Permite que las peticiones puedan enviar body JSON

const PORT = 3001;

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
  console.log(header)


  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(token, "contraseñasupersegurayprivadaquenadietienequeconocer")

    req.userLogged = decoded

    next()
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}

// server.use(authMiddleware)

// ----------------------------------

// Status

server.get("/", (req, res) => {
  res.status(500).json({ status: "off" })
})

// Obtener TODOS los productos

server.get("/products", authMiddleware, (req, res) => {
  const userLogged = req.userLogged
  const filterProducts = products.filter(product => product.userId === userLogged.id)
  res.json(filterProducts)
})

// Obtener UN producto por su ID

server.get("/products/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const foundProduct = products.find((product) => product.id === id); // Return implícito de Arrow Function
  if (!foundProduct) return res.status(404).json({ error: "Not found" }) // Le agregué return al if para que corte la ejecución cuando no encuentra el producto
res.json(foundProduct)
});

// Agregar un producto

server.post("/products", authMiddleware, (req, res) => {
  const body = req.body;
   const userLogged = req.userLogged

  const newProduct = {
    id: products.length + 1,
    ...body,
    userId: userLogged.id
  };
  products.push(newProduct);
  res.json(newProduct);
});

// Actualizar un producto por ID

// server.put("/products/:id", authMiddleware, (req, res) => {
//   const { id } = req.params;
//   const body = req.body;

//   const foundProduct = products.find((product) => product.id === Number(id));

//   if (body.name) foundProduct.name = body.name;
//   if (body.price) foundProduct.price = body.price;
//   if (body.category) foundProduct.category = body.category;
//   if (body.stock) foundProduct.stock = body.stock;
//   if (body.available) foundProduct.available = body.available;
//   res.json(foundProduct);
// });

// FIX

server.put("/products/:id", authMiddleware, (req, res) => {
  const { id } = req.params
  const body = req.body
  const userLogged = req.userLogged

  const foundProduct = products.find((product) => product.id === Number(id))

  if (!foundProduct) {
    return res.status(404).json({ error: "Not found" })
  }

  if (foundProduct.userId !== userLogged.id) { // Verificar que el producto pertenezca al usuario logueado antes de actualizar.
    return res.status(403).json({ error: "Forbidden" })
  }

  if (body.name) foundProduct.name = body.name
  if (body.price) foundProduct.price = body.price
  if (body.category) foundProduct.category = body.category
  if (body.stock) foundProduct.stock = body.stock
  if (body.available) foundProduct.available = body.available
  res.json(foundProduct)
})

// Eliminar UN producto por su ID

// server.delete("/products/:id", authMiddleware, (req, res) => {
//   const { id } = req.params
//   const index = products.findIndex(product => product.id === Number(id))
//   if (index === -1) {
//     return res.status(404).json({ error: "Not found" })
//   }
//   products.splice(index, 1)
//   res.json({ message: "Producto eliminado" })
// })

// FIX 
server.delete("/products/:id", authMiddleware, (req, res) => {
  const { id } = req.params
  const userLogged = req.userLogged
  const index = products.findIndex(product => product.id === Number(id))
  
  if (index === -1) {
    return res.status(404).json({ error: "Not found" })
  }

  if (products[index].userId !== userLogged.id) { // Verificar que el producto pertenezca al usuario logueado antes de borrar.
    return res.status(403).json({ error: "Forbidden" })
  }

  products.splice(index, 1)
  res.json({ message: "Producto eliminado" })
})

// ---------------------------- Usuarios
// Registro

server.post("/auth/register", async (req, res) => {
  const { body } = req

  const id = users.length + 1

  const { password, username, email } = body
  // AGREGAR ESTRUCTURA VALIDA DE EMAIL VALIDACION
  const foundUser = users.find(user => user.email === email)

  if (foundUser) {
    return res.status(409).json({ error: "Conflict, user already exists" })
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id,
    username,
    email,
    password: hashPassword,
  }

  users.push(newUser)

  const { password: passwordNewUser, ...data } = newUser

  res.json(data)
})

// Login

server.post("/auth/login", limiter, async (req, res) => { // limiter → middleware local (en este caso)
  const { body, ip } = req

  const { email, password } = body

  if (!email || !password) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const foundUser = users.find(user => user.email === email)

  if (!foundUser) {
    return res.status(403).json({ error: "Unauthorized" })
  }

  const isValid = await bcrypt.compare(password, foundUser.password)

  if (!isValid) {
    return res.status(403).json({ error: "Unauthorized" })
  }

  // TOKEN JWT → Json Web Token → string

  const payload = { id: foundUser.id, username: foundUser.username, email: foundUser.email }
  const secretKey = "contraseñasupersegurayprivadaquenadietienequeconocer" 

  const token = jwt.sign(payload, secretKey, { expiresIn: "1m" })

  res.json({ token })
 })


// Servidor en escucha en el puerto seleccionado

server.listen(PORT, () => {
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`);
});
