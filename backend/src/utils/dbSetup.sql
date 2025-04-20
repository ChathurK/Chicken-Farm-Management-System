-- Drop database if exists and create new one
DROP DATABASE IF EXISTS ChickenFarmManagementSystem;
CREATE DATABASE ChickenFarmManagementSystem;
USE ChickenFarmManagementSystem;

-- Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Feed', 'Medication', 'Supplies', 'Other') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    purchase_date DATE,
    expiration_date DATE,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0.00,
    total_cost DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,
    status ENUM('Available', 'Low', 'Finished', 'Expired') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buyers table
CREATE TABLE Buyers (
    buyer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sellers table
CREATE TABLE Sellers (
    seller_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Livestock table
CREATE TABLE Livestock (
    livestock_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Chicken', 'Chick', 'Egg') NOT NULL,
    total_quantity INT NOT NULL,
    status ENUM('Available', 'Reserved', 'Sold') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chickens table
CREATE TABLE Chicken_Records (
    chicken_record_id INT AUTO_INCREMENT PRIMARY KEY,
    livestock_id INT NOT NULL,
    type ENUM('Layer', 'Broiler', 'Breeder') NOT NULL,
    breed VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    age_weeks INT,
    acquisition_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livestock_id) REFERENCES Livestock(livestock_id) ON DELETE CASCADE
);

-- Chicks table
CREATE TABLE Chick_Records (
    chick_record_id INT AUTO_INCREMENT PRIMARY KEY,
    livestock_id INT NOT NULL,
    parent_breed VARCHAR(50),
    hatched_date DATE NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livestock_id) REFERENCES Livestock(livestock_id) ON DELETE CASCADE
);

-- Eggs table
CREATE TABLE Egg_Records (
    egg_record_id INT AUTO_INCREMENT PRIMARY KEY,
    livestock_id INT NOT NULL,
    laid_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    quantity INT NOT NULL,
    size ENUM('Small', 'Medium', 'Large', 'Extra Large') NOT NULL,
    color ENUM('White', 'Brown', 'Other') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livestock_id) REFERENCES Livestock(livestock_id) ON DELETE CASCADE,
    CONSTRAINT check_expiration CHECK (expiration_date > laid_date)
);

-- Orders table
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline_date DATE,
    status ENUM('Ongoing', 'Completed', 'Cancelled') DEFAULT 'Ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Buyers(buyer_id) ON DELETE CASCADE,
    CONSTRAINT check_deadline CHECK (deadline_date >= DATE(order_date))
);

-- Order_Items table
CREATE TABLE Order_Items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    livestock_id INT NOT NULL,
    product_type ENUM('Chicken', 'Chick', 'Egg') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (livestock_id) REFERENCES Livestock(livestock_id)
);

-- Transactions table
-- Note: inventory_id is related to Transaction to track inventory purchases
-- livestock_id added to track livestock sales/purchases
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('Income', 'Expense') NOT NULL,
    category ENUM(
        'Livestock Purchase',
        'Livestock Sale',
        'Inventory Purchase',
        'Other'
    ) NOT NULL,
    inventory_id INT,
    livestock_id INT,
    buyer_id INT,
    seller_id INT,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES Inventory(inventory_id),
    FOREIGN KEY (livestock_id) REFERENCES Livestock(livestock_id),
    FOREIGN KEY (buyer_id) REFERENCES Buyers(buyer_id),
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id)
);

-- Employees table (for additional employee info)
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department VARCHAR(50),
    position VARCHAR(100),
    salary DECIMAL(10, 2),
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);