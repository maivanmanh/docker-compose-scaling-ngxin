const express = require("express");
const os = require("os");

const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

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

let dbSource = "memory";
let sequelize = null;
let ProductModel = null;

async function tryConnectMySQL() {
  try {
    sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST,
        dialect: "mysql",
        pool: {
          max: 5,
          min: 0,
          acquire: 5000,
          idle: 10000,
        },
        logging: false,
      }
    );
    // Define Product model
    ProductModel = sequelize.define(
      "Product",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
      },
      {
        tableName: "products",
        timestamps: false,
      }
    );
    await sequelize.authenticate();
    await ProductModel.sync();
    dbSource = "mysql";
    console.log("Connected to MySQL via Sequelize");
  } catch (err) {
    sequelize = null;
    ProductModel = null;
    dbSource = "memory";
    console.log("Could not connect to MySQL, using in-memory DB.", err.message);
  }finally {
    console.log({host: process.env.MYSQL_HOST, db: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      pass: process.env.MYSQL_PASSWORD})
  }
}

// Try to connect to MySQL on startup
tryConnectMySQL();

// Utility function to wrap all responses
function withHost(data) {
  return {
    hostname,
    dbSource,
    data,
  };
}

// ----- Home -----
app.get("/", (req, res) => {
  res.json(withHost({ message: "Welcome to the Products API", products: "/products" }));
});

// ----- CRUD ENDPOINTS -----

// Get all products
app.get("/products", async (req, res) => {
  if (dbSource === "mysql" && ProductModel) {
    try {
      const rows = await ProductModel.findAll();
      return res.json(withHost(rows));
    } catch (err) {
      dbSource = "memory";
      return res.json(withHost(products));
    }
  } else {
    return res.json(withHost(products));
  }
});

// Get one product by id
app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (dbSource === "mysql" && ProductModel) {
    try {
      const product = await ProductModel.findByPk(id);
      if (!product) {
        return res.status(404).json(withHost({ error: "Product not found" }));
      }
      return res.json(withHost(product));
    } catch (err) {
      dbSource = "memory";
      const product = products.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json(withHost({ error: "Product not found" }));
      }
      return res.json(withHost(product));
    }
  } else {
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json(withHost({ error: "Product not found" }));
    }
    return res.json(withHost(product));
  }
});

// Create new product
app.post("/products", async (req, res) => {
  if (dbSource === "mysql" && ProductModel) {
    try {
      const { name, price } = req.body;
      const newProduct = await ProductModel.create({ name, price });
      return res.status(201).json(withHost(newProduct));
    } catch (err) {
      dbSource = "memory";
      // fallback to memory
    }
  }
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name: req.body.name,
    price: req.body.price,
  };
  products.push(newProduct);
  return res.status(201).json(withHost(newProduct));
});

// Update product
app.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (dbSource === "mysql" && ProductModel) {
    try {
      const { name, price } = req.body;
      const product = await ProductModel.findByPk(id);
      if (!product) {
        return res.status(404).json(withHost({ error: "Product not found" }));
      }
      product.name = name;
      product.price = price;
      await product.save();
      return res.json(withHost(product));
    } catch (err) {
      dbSource = "memory";
      // fallback to memory
    }
  }
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json(withHost({ error: "Product not found" }));
  }
  products[index] = { id, ...req.body };
  return res.json(withHost(products[index]));
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (dbSource === "mysql" && ProductModel) {
    try {
      const product = await ProductModel.findByPk(id);
      if (!product) {
        return res.status(404).json(withHost({ error: "Product not found" }));
      }
      await product.destroy();
      return res.json(withHost({ deleted: id }));
    } catch (err) {
      dbSource = "memory";
      // fallback to memory
    }
  }
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json(withHost({ error: "Product not found" }));
  }
  const deleted = products.splice(index, 1);
  return res.json(withHost({ deleted }));
});

// ----- Start server -----
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
