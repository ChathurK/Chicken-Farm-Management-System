const bcrypt = require('bcrypt');
const db = require('../config/database');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed Users table
    console.log('Seeding Users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await db.execute(`
      INSERT INTO Users (full_name, email, password_hash, role) VALUES 
      ('Admin User', 'admin@chickenfarm.com', ?, 'Admin'),
      ('Employee User', 'employee@chickenfarm.com', ?, 'Employee')
    `, [passwordHash, passwordHash]);
    
    // Seed Buyers
    console.log('Seeding Buyers...');
    await db.execute(`
      INSERT INTO Buyers (full_name, contact_number, email, address) VALUES 
      ('Martha Restaurant', '123-456-7890', 'orders@martha.com', '123 Main St, Cityville'),
      ('Fresh Foods Market', '234-567-8901', 'purchasing@freshfoods.com', '456 Oak Ave, Townsburg'),
      ('Grocery Express', '345-678-9012', 'supply@groceryexpress.com', '789 Pine Rd, Villageton')
    `);
    
    // Seed Sellers
    console.log('Seeding Sellers...');
    await db.execute(`
      INSERT INTO Sellers (name, contact_number, email, address) VALUES 
      ('Feed Supply Co', '456-789-0123', 'sales@feedsupply.com', '101 Grain St, Farmville'),
      ('Chicken Health Products', '567-890-1234', 'orders@chickenhealth.com', '202 Medicine Ave, Vettown'),
      ('Farm Equipment Ltd', '678-901-2345', 'info@farmequipment.com', '303 Tool Rd, Machinery City')
    `);
    
    // Seed Inventory
    console.log('Seeding Inventory...');
    await db.execute(`
      INSERT INTO Inventory (category, item_name, batch_number, quantity, unit, purchase_date, expiration_date, cost_per_unit, total_cost, status) VALUES 
      ('Eggs', 'Large Brown Eggs', 'EGG-2023-01', 500, 'dozen', '2023-01-15', '2023-02-15', 2.50, 1250.00, 'Available'),
      ('Eggs', 'Medium White Eggs', 'EGG-2023-02', 300, 'dozen', '2023-01-20', '2023-02-20', 2.00, 600.00, 'Available'),
      ('Chicks', 'Rhode Island Red Chicks', 'CHK-2023-01', 100, 'chick', '2023-01-10', NULL, 3.50, 350.00, 'Available'),
      ('Chickens', 'Layer Hens', 'HEN-2023-01', 50, 'chicken', '2022-10-15', NULL, 15.00, 750.00, 'Available'),
      ('Feed', 'Organic Layer Feed', 'FEED-2023-01', 500, 'kg', '2023-01-05', '2023-07-05', 1.20, 600.00, 'Available'),
      ('Medication', 'Poultry Vitamins', 'MED-2023-01', 20, 'bottle', '2023-01-02', '2024-01-02', 12.50, 250.00, 'Available'),
      ('Supplies', 'Egg Cartons', 'SUP-2023-01', 1000, 'carton', '2023-01-03', NULL, 0.25, 250.00, 'Available')
    `);
    
    // Seed Orders
    console.log('Seeding Orders...');
    await db.execute(`
      INSERT INTO Orders (buyer_id, order_date, deadline_date, status) VALUES 
      (1, '2023-01-20', '2023-01-25', 'Completed'),
      (2, '2023-01-22', '2023-01-28', 'Ongoing'),
      (3, '2023-01-25', '2023-02-01', 'Ongoing')
    `);
    
    // Seed Order Items
    console.log('Seeding Order Items...');
    await db.execute(`
      INSERT INTO Order_Items (order_id, inventory_id, quantity, unit_price) VALUES 
      (1, 1, 20, 3.50), -- 20 dozen Large Brown Eggs
      (1, 2, 10, 3.00), -- 10 dozen Medium White Eggs
      (2, 1, 30, 3.50), -- 30 dozen Large Brown Eggs
      (3, 3, 25, 4.50), -- 25 Rhode Island Red Chicks
      (3, 5, 50, 1.80)  -- 50 kg Organic Layer Feed
    `);
    
    // Seed Transactions
    console.log('Seeding Transactions...');
    await db.execute(`
      INSERT INTO Transactions (transaction_type, inventory_id, buyer_id, seller_id, amount, description) VALUES 
      ('Income', 1, 1, NULL, 70.00, 'Sale of 20 dozen Large Brown Eggs'),
      ('Income', 2, 1, NULL, 30.00, 'Sale of 10 dozen Medium White Eggs'),
      ('Income', 1, 2, NULL, 105.00, 'Sale of 30 dozen Large Brown Eggs'),
      ('Income', 3, 3, NULL, 112.50, 'Sale of 25 Rhode Island Red Chicks'),
      ('Income', 5, 3, NULL, 90.00, 'Sale of 50 kg Organic Layer Feed'),
      ('Expense', 5, NULL, 1, 600.00, 'Purchase of 500 kg Organic Layer Feed'),
      ('Expense', 6, NULL, 2, 250.00, 'Purchase of 20 bottles of Poultry Vitamins'),
      ('Expense', 7, NULL, 3, 250.00, 'Purchase of 1000 Egg Cartons')
    `);

    // Seed Employees
    console.log('Seeding Employees...');
    await db.execute(`
      INSERT INTO Employees (user_id, department, position, salary, hire_date) VALUES 
      (1, 'Management', 'Farm Manager', 60000.00, '2022-01-15'),
      (2, 'Operations', 'Farm Worker', 35000.00, '2022-03-01')
    `);

    // Seed Livestock
    console.log('Seeding Livestock...');
    await db.execute(`
      INSERT INTO Livestock (type, breed, quantity, age_weeks, health_status, acquisition_date, notes) VALUES 
      ('Chicken', 'Rhode Island Red', 150, 25, 'Healthy', '2022-07-15', 'Productive laying hens'),
      ('Chicken', 'Leghorn', 100, 28, 'Healthy', '2022-06-10', 'High egg production'),
      ('Chick', 'Plymouth Rock', 75, 3, 'Healthy', '2023-01-05', 'Growing well'),
      ('Egg', 'Rhode Island Red', 200, NULL, 'Healthy', '2023-01-18', 'Fertilized eggs for hatching')
    `);

    console.log('Database seeding completed successfully.');
    
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    process.exit();
  }
}

seedDatabase();