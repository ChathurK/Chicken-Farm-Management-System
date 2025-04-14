-- Here is the expected database schema for this project:
-- This schema defines the structure of the database, including tables, columns, data types, 
-- and relationships between tables. It serves as a blueprint for how data is organized 
-- and stored in the database.

CREATE SCHEMA ChickenFarmManagementSystem;
USE ChickenFarmManagementSystem;

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Employee')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Inventory (
    inventory_id SERIAL PRIMARY KEY,
    category VARCHAR(50) CHECK (category IN ('Eggs', 'Chicks', 'Chickens', 'Feed', 'Medication', 'Supplies')) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20),  -- e.g., pieces, kg, ml
    purchase_date DATE,
    expiration_date DATE,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    status VARCHAR(50) CHECK (status IN ('Available', 'Expired', 'Damaged')) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Buyers (
    buyer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Sellers (
    seller_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('Income', 'Expense')) NOT NULL,
    inventory_id INT REFERENCES Inventory(inventory_id) ON DELETE SET NULL,
    buyer_id INT REFERENCES Buyers(buyer_id) ON DELETE SET NULL,
    seller_id INT REFERENCES Sellers(seller_id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    buyer_id INT REFERENCES Buyers(buyer_id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Ongoing', 'Ready', 'Completed')) DEFAULT 'Ongoing'
);

CREATE TABLE Order_Items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id) ON DELETE CASCADE,
    inventory_id INT REFERENCES Inventory(inventory_id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE Reports (
    report_id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) CHECK (report_type IN ('Financial', 'Inventory')) NOT NULL,
    generated_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT NOT NULL  -- Path to stored PDF/Excel
);
