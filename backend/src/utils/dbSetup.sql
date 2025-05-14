-- Drop database if exists and create new one
DROP DATABASE IF EXISTS ChickenFarmManagementSystem;
CREATE DATABASE ChickenFarmManagementSystem;
USE ChickenFarmManagementSystem;

-- Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table (for additional employee info)
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department VARCHAR(50),
    position VARCHAR(100),
    salary DECIMAL(10, 2),
    hire_date DATE NOT NULL,
    contact_number VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Buyers table
CREATE TABLE Buyers (
    buyer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sellers table
CREATE TABLE Sellers (
    seller_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chickens table
CREATE TABLE Chicken_Records (
    chicken_record_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Layer', 'Broiler', 'Breeder') NOT NULL,
    breed VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    age_weeks INT DEFAULT NULL,
    acquisition_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chicks table
CREATE TABLE Chick_Records (
    chick_record_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_breed VARCHAR(50),
    hatched_date DATE NOT NULL,
    quantity INT NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Eggs table
CREATE TABLE Egg_Records (
    egg_record_id INT AUTO_INCREMENT PRIMARY KEY,
    laid_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    quantity INT NOT NULL,
    size ENUM('Small', 'Medium', 'Large') NOT NULL,
    color ENUM('White', 'Brown') NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT check_expiration CHECK (expiration_date > laid_date)
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

-- Transactions table
-- Note: inventory_id is related to Transaction to track inventory purchases
-- Now directly connects to chicken, chick, and egg records
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type ENUM('Income', 'Expense') NOT NULL,
    category ENUM(
        'Chicken Purchase',
        'Chicken Sale',
        'Chick Purchase',
        'Chick Sale',
        'Egg Purchase',
        'Egg Sale',
        'Inventory Purchase',
        'Other'
    ) NOT NULL,
    buyer_id INT,
    seller_id INT,
    amount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    inventory_id INT,
    chicken_record_id INT,
    chick_record_id INT,
    egg_record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES Inventory(inventory_id),
    FOREIGN KEY (chicken_record_id) REFERENCES Chicken_Records(chicken_record_id),
    FOREIGN KEY (chick_record_id) REFERENCES Chick_Records(chick_record_id),
    FOREIGN KEY (egg_record_id) REFERENCES Egg_Records(egg_record_id),
    FOREIGN KEY (buyer_id) REFERENCES Buyers(buyer_id),
    FOREIGN KEY (seller_id) REFERENCES Sellers(seller_id)
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
    product_type ENUM('Chicken', 'Chick', 'Egg') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    chicken_record_id INT,
    chick_record_id INT,
    egg_record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (chicken_record_id) REFERENCES Chicken_Records(chicken_record_id),
    FOREIGN KEY (chick_record_id) REFERENCES Chick_Records(chick_record_id),
    FOREIGN KEY (egg_record_id) REFERENCES Egg_Records(egg_record_id),
    CONSTRAINT check_one_product_type CHECK (
        (chicken_record_id IS NOT NULL AND chick_record_id IS NULL AND egg_record_id IS NULL AND product_type = 'Chicken') OR
        (chicken_record_id IS NULL AND chick_record_id IS NOT NULL AND egg_record_id IS NULL AND product_type = 'Chick') OR
        (chicken_record_id IS NULL AND chick_record_id IS NULL AND egg_record_id IS NOT NULL AND product_type = 'Egg')
    )
);