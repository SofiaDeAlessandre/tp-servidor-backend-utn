import express from "express";

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

const server = express();

// Permite que las peticiones puedan enviar body JSON
server.use(express.json());

const PORT = 3001;

server.get("/", (req, res) => {
  res.json({ data: 1 });
});

// Obtener TODOS los productos

server.get("/products", (req, res) => {
  res.json(products);
});

// Obtener UN producto por su ID

server.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const foundProduct = products.find((product) => product.id === id); // Return implícito de Arrow Function
  if (!foundProduct) res.status(404).json({ error: "Not found" }); // Return implícito
  res.json(foundProduct);
});

// Agregar un producto

server.post("/products", (req, res) => {
  const body = req.body;
  const newProduct = {
    id: products.length + 1,
    ...body,
  };
  products.push(newProduct);
  res.json(newProduct);
});

// Actualizar un producto por ID

server.put("/products/:id", (req, res) => {
  const id = +req.params.id;
  const body = req.body;

  const foundProduct = products.find((product) => product.id === id);

  if (body.name) foundProduct.name = body.name;
  if (body.price) foundProduct.price = body.price;
  if (body.category) foundProduct.category = body.category;
  if (body.stock) foundProduct.stock = body.stock;
  if (body.available) foundProduct.available = body.available;
  res.json(foundProduct);
});

// Eliminar UN producto por su ID

server.delete("/products/:id", (req, res) => {
  const id = +req.params.id;
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }
  products.splice(index, 1);
  res.json({ message: "Producto eliminado" });
});

// Iniciar el servidor

server.listen(PORT, () => {
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`);
});
