const bcrypt = require('bcrypt');
const db = require('../config/database');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed Users table
    console.log('Seeding Users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await db.execute(`
      INSERT INTO Users (first_name, last_name, email, password_hash, role) VALUES 
      ('Admin', 'User', 'admin@chickenfarm.com', ?, 'Admin'),
      ('Employee', 'User', 'employee@chickenfarm.com', ?, 'Employee')
    `, [passwordHash, passwordHash]);
    
    // Seed Buyers
    console.log('Seeding Buyers...');
    await db.execute(`
      INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES 
      ('Martha', 'Restaurant', '123-456-7890', 'orders@martha.com', '123 Main St, Cityville'),
      ('Fresh', 'Foods Market', '234-567-8901', 'purchasing@freshfoods.com', '456 Oak Ave, Townsburg'),
      ('Grocery', 'Express', '345-678-9012', 'supply@groceryexpress.com', '789 Pine Rd, Villageton')
    `);
    
    // Seed Sellers
    console.log('Seeding Sellers...');
    await db.execute(`
      INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES 
      ('Feed', 'Supply Co', '456-789-0123', 'sales@feedsupply.com', '101 Grain St, Farmville'),
      ('Chicken', 'Health Products', '567-890-1234', 'orders@chickenhealth.com', '202 Medicine Ave, Vettown'),
      ('Farm', 'Equipment Ltd', '678-901-2345', 'info@farmequipment.com', '303 Tool Rd, Machinery City')
    `);
    
    // Seed Inventory
    console.log('Seeding Inventory...');
    await db.execute(`
      INSERT INTO Inventory (category, item_name, quantity, unit, purchase_date, expiration_date, cost_per_unit, status) VALUES 
      ('Feed', 'Organic Layer Feed', 500, 'kg', '2023-01-05', '2023-07-05', 1.20, 'Available'),
      ('Medication', 'Poultry Vitamins', 20, 'bottle', '2023-01-02', '2024-01-02', 12.50, 'Available'),
      ('Supplies', 'Egg Cartons', 1000, 'carton', '2023-01-03', NULL, 0.25, 'Available'),
      ('Feed', 'Chick Starter Feed', 300, 'kg', '2023-01-10', '2023-06-10', 1.50, 'Available'),
      ('Supplies', 'Bedding Material', 50, 'bag', '2023-01-15', NULL, 8.00, 'Available')
    `);
    
    // Seed Livestock
    console.log('Seeding Livestock...');
    await db.execute(`
      INSERT INTO Livestock (type, total_quantity, status) VALUES 
      ('Chicken', 250, 'Available'),
      ('Chick', 75, 'Available'),
      ('Egg', 500, 'Available')
    `);
    
    // Seed Chicken_Records
    console.log('Seeding Chicken_Records...');
    await db.execute(`
      INSERT INTO Chicken_Records (livestock_id, type, breed, quantity, age_weeks, acquisition_date, notes) VALUES 
      (1, 'Layer', 'Rhode Island Red', 150, 25, '2022-07-15', 'Productive laying hens'),
      (1, 'Layer', 'Leghorn', 100, 28, '2022-06-10', 'High egg production')
    `);
    
    // Seed Chick_Records
    console.log('Seeding Chick_Records...');
    await db.execute(`
      INSERT INTO Chick_Records (livestock_id, parent_breed, hatched_date, quantity, notes) VALUES 
      (2, 'Plymouth Rock', '2023-01-05', 75, 'Growing well')
    `);
    
    // Seed Egg_Records
    console.log('Seeding Egg_Records...');
    await db.execute(`
      INSERT INTO Egg_Records (livestock_id, laid_date, expiration_date, quantity, size, color, notes) VALUES 
      (3, '2023-01-18', '2023-02-18', 300, 'Large', 'Brown', 'Fresh farm eggs'),
      (3, '2023-01-19', '2023-02-19', 200, 'Medium', 'White', 'From Leghorn chickens')
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
      INSERT INTO Order_Items (order_id, livestock_id, product_type, quantity, unit_price) VALUES 
      (1, 3, 'Egg', 20, 3.50),
      (1, 3, 'Egg', 10, 3.00),
      (2, 3, 'Egg', 30, 3.50),
      (3, 2, 'Chick', 25, 4.50),
      (3, 1, 'Chicken', 5, 15.00)
    `);
    
    // Seed Transactions
    console.log('Seeding Transactions...');
    await db.execute(`
      INSERT INTO Transactions (transaction_type, category, inventory_id, livestock_id, buyer_id, seller_id, amount, description) VALUES 
      ('Income', 'Livestock Sale', NULL, 3, 1, NULL, 70.00, 'Sale of eggs to Martha Restaurant'),
      ('Income', 'Livestock Sale', NULL, 3, 1, NULL, 30.00, 'Additional egg sale to Martha Restaurant'),
      ('Income', 'Livestock Sale', NULL, 3, 2, NULL, 105.00, 'Sale of eggs to Fresh Foods Market'),
      ('Income', 'Livestock Sale', NULL, 2, 3, NULL, 112.50, 'Sale of chicks to Grocery Express'),
      ('Income', 'Livestock Sale', NULL, 1, 3, NULL, 75.00, 'Sale of chickens to Grocery Express'),
      ('Expense', 'Inventory Purchase', 1, NULL, NULL, 1, 600.00, 'Purchase of Organic Layer Feed'),
      ('Expense', 'Inventory Purchase', 2, NULL, NULL, 2, 250.00, 'Purchase of Poultry Vitamins'),
      ('Expense', 'Inventory Purchase', 3, NULL, NULL, 3, 250.00, 'Purchase of Egg Cartons')
    `);

    // Seed Employees
    console.log('Seeding Employees...');
    await db.execute(`
      INSERT INTO Employees (user_id, department, position, salary, hire_date) VALUES 
      (1, 'Management', 'Farm Manager', 60000.00, '2022-01-15'),
      (2, 'Operations', 'Farm Worker', 35000.00, '2022-03-01')
    `);

    console.log('Database seeding completed successfully.');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1)
  }
}

seedDatabase();