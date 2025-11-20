const express = require("express");
const os = require("os");

const app = express();
app.use(express.json());

const hostname = os.hostname();

// ----- In-memory product list -----
let products = [
  { id: 1, name: "Keyboard", price: 25 },
  { id: 2, name: "Mouse", price: 15 },
  { id: 3, name: "Monitor", price: 120 },
  { id: 4, name: "Laptop", price: 950 },
  { id: 5, name: "USB Cable", price: 5 },
  { id: 6, name: "Headset", price: 45 },
  { id: 7, name: "Webcam", price: 60 },
  { id: 8, name: "Desk Lamp", price: 30 },
  { id: 9, name: "Microphone", price: 80 },
  { id: 10, name: "Chair", price: 150 },
];

// Utility function to wrap all responses
function withHost(data) {
  return {
    hostname,
    data,
  };
}

// ----- Home -----
app.get("/", (req, res) => {
  res.json(withHost({ message: "Welcome to the Products API" }));
});

// ----- CRUD ENDPOINTS -----

// Get all products
app.get("/products", (req, res) => {
  res.json(withHost(products));
});

// Get one product by id
app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json(withHost({ error: "Product not found" }));
  }
  res.json(withHost(product));
});

// Create new product
app.post("/products", (req, res) => {
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name: req.body.name,
    price: req.body.price,
  };
  products.push(newProduct);
  res.status(201).json(withHost(newProduct));
});

// Update product
app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json(withHost({ error: "Product not found" }));
  }

  products[index] = { id, ...req.body };
  res.json(withHost(products[index]));
});

// Delete product
app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json(withHost({ error: "Product not found" }));
  }

  const deleted = products.splice(index, 1);
  res.json(withHost({ deleted }));
});

// ----- Start server -----
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
