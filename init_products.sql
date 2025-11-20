-- Create database
CREATE DATABASE IF NOT EXISTS products_db;
USE products_db;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price FLOAT NOT NULL
);

-- Insert initial products
INSERT INTO products (name, price) VALUES
  ('Keyboard', 25),
  ('Mouse', 15),
  ('Monitor', 120),
  ('Laptop', 950),
  ('USB Cable', 5),
  ('Headset', 45),
  ('Webcam', 60),
  ('Desk Lamp', 30),
  ('Microphone', 80),
  ('Chair', 150);
