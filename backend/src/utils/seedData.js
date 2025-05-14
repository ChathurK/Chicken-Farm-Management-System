const bcrypt = require("bcrypt");
const db = require("../config/database");

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Seed Users table - keeping Admin and Employee users unchanged
    console.log("Seeding Users...");
    const passwordHash = await bcrypt.hash("password123", 10);

    await db.execute(
      `
      INSERT INTO Users (first_name, last_name, email, password_hash, role) VALUES 
      ('Admin', 'User', 'admin@chickenfarm.com', ?, 'Admin'),
      ('Employee', 'User', 'employee@chickenfarm.com', ?, 'Employee')
    `,
      [passwordHash, passwordHash]
    );

    // Seed Employees table
    console.log("Seeding Employees...");
    await db.execute(`
      INSERT INTO Employees (user_id, department, position, salary, hire_date, contact_number, address) VALUES 
      (1, 'Management', 'Farm Manager', 150000.00, '2022-01-15', '077-1234567', '123 Kandy Road, Kadawatha'),
      (2, 'Operations', 'Farm Worker', 75000.00, '2022-03-01', '071-2345678', '456 Galle Road, Panadura')
    `);

    // Seed Buyers with Sri Lankan context
    console.log("Seeding Buyers...");
    await db.execute(`
      INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES 
      ('Cargills', 'Food City', '011-7890123', 'orders@cargills.lk', '40 York Street, Colombo 01'),
      ('Keells', 'Super', '011-8901234', 'purchasing@keells.lk', 'P.O. Box 10, Colombo 10'),
      ('Arpico', 'Super Centre', '011-9012345', 'supply@arpico.lk', 'No. 310, High Level Road, Nugegoda')
    `);

    // Seed Sellers with Sri Lankan context
    console.log("Seeding Sellers...");
    await db.execute(`
      INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES 
      ('CIC', 'Feeds', '011-2345678', 'sales@cicfeeds.lk', 'CIC House, Colombo 7'),
      ('Lankan', 'Animal Health', '011-3456789', 'orders@lankahealth.lk', '15 Dharmapala Mawatha, Colombo 3'),
      ('Hayleys', 'Agriculture', '011-4567890', 'info@hayagri.lk', 'Hayleys Building, 400 Deans Road, Colombo 10')
    `);

    // Seed Inventory
    console.log("Seeding Inventory...");
    await db.execute(`
      INSERT INTO Inventory (category, item_name, quantity, unit, purchase_date, expiration_date, cost_per_unit, status) VALUES 
      ('Feed', 'Layer Crumble Feed', 500, 'kg', '2023-01-05', '2023-07-05', 125.00, 'Available'),
      ('Medication', 'Poultry Vitamins', 20, 'bottle', '2023-01-02', '2024-01-02', 850.00, 'Available'),
      ('Supplies', 'Egg Cartons', 1000, 'carton', '2023-01-03', NULL, 45.00, 'Available'),
      ('Feed', 'Chick Starter Feed', 300, 'kg', '2023-01-10', '2023-06-10', 150.00, 'Available'),
      ('Supplies', 'Bedding Material', 50, 'bag', '2023-01-15', NULL, 750.00, 'Available')
    `);

    // Seed Chicken_Records
    console.log("Seeding Chicken_Records...");
    await db.execute(`
      INSERT INTO Chicken_Records (type, breed, quantity, age_weeks, acquisition_date, notes) VALUES 
      ('Layer', 'Rhode Island Red', 150, 25, '2022-07-15', 'Productive laying hens imported from India'),
      ('Layer', 'Leghorn', 100, 28, '2022-06-10', 'High egg production suitable for Sri Lankan climate'),
      ('Broiler', 'Cobb 500', 200, 6, '2022-12-01', 'Fast growing meat birds')
    `);

    // Seed Chick_Records
    console.log("Seeding Chick_Records...");
    await db.execute(`
      INSERT INTO Chick_Records (parent_breed, hatched_date, quantity, notes) VALUES 
      ('Plymouth Rock', '2023-01-05', 75, 'Growing well in local conditions'),
      ('Rhode Island Red', '2023-01-10', 50, 'Hatched from our best layers')
    `);

    // Seed Egg_Records
    console.log("Seeding Egg_Records...");
    await db.execute(`
      INSERT INTO Egg_Records (laid_date, expiration_date, quantity, size, color, notes) VALUES 
      ('2023-01-18', '2023-02-18', 300, 'Large', 'Brown', 'Fresh farm eggs for local markets'),
      ('2023-01-19', '2023-02-19', 200, 'Medium', 'White', 'From Leghorn chickens, popular in Colombo')
    `);

    // Seed Orders
    console.log("Seeding Orders...");
    await db.execute(`
      INSERT INTO Orders (buyer_id, order_date, deadline_date, status) VALUES 
      (1, '2023-01-20', '2023-01-25', 'Completed'),
      (2, '2023-01-22', '2023-01-28', 'Ongoing'),
      (3, '2023-01-25', '2023-02-01', 'Ongoing')
    `);

    // Seed Order Items with CALCULATED total_price (quantity * unit_price)
    console.log("Seeding Order Items...");
    await db.execute(`
      INSERT INTO Order_Items (order_id, product_type, quantity, unit_price, total_price, egg_record_id, chick_record_id, chicken_record_id) VALUES 
      (1, 'Egg', 20, 35.00, 700.00, 1, NULL, NULL),
      (1, 'Egg', 10, 30.00, 300.00, 2, NULL, NULL),
      (2, 'Egg', 30, 35.00, 1050.00, 1, NULL, NULL),
      (3, 'Chick', 25, 175.00, 4375.00, NULL, 1, NULL),
      (3, 'Chicken', 5, 1500.00, 7500.00, NULL, NULL, 3)
    `);

    // Seed Transactions
    console.log("Seeding Transactions...");
    await db.execute(`
      INSERT INTO Transactions (transaction_type, category, buyer_id, seller_id, amount, notes, inventory_id, chicken_record_id, egg_record_id, chick_record_id) VALUES 
      ('Income', 'Egg Sale', 1, NULL, 700.00, 'Sale of eggs to Cargills Food City', NULL, NULL, 1, NULL),
      ('Income', 'Egg Sale', 1, NULL, 300.00, 'Additional egg sale to Cargills', NULL, NULL, 2, NULL),
      ('Income', 'Egg Sale', 2, NULL, 1050.00, 'Sale of eggs to Keells Super', NULL, NULL, 1, NULL),
      ('Income', 'Chick Sale', 3, NULL, 4375.00, 'Sale of chicks to Arpico', NULL, NULL, NULL, 1),
      ('Income', 'Chicken Sale', 3, NULL, 7500.00, 'Sale of broilers to Arpico', NULL, 3, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 1, 62500.00, 'Purchase of Layer Crumble Feed', 1, NULL, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 2, 17000.00, 'Purchase of Poultry Vitamins', 2, NULL, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 3, 45000.00, 'Purchase of Egg Cartons', 3, NULL, NULL, NULL)
    `);

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
