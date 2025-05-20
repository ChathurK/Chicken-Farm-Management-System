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

    // Seed Employees table with 5 entries in Sri Lankan context
    console.log("Seeding Employees...");
    await db.execute(`
      INSERT INTO Employees (user_id, department, position, salary, hire_date, contact_number, address) VALUES 
      (1, 'Management', 'Farm Manager', 175000.00, '2023-06-15', '077-1234567', '123 Kandy Road, Kadawatha'),
      (2, 'Operations', 'Farm Worker', 85000.00, '2024-01-10', '071-2345678', '456 Galle Road, Panadura'),
      (NULL, 'Operations', 'Feed Specialist', 95000.00, '2024-03-15', '077-3456789', '78 Baseline Road, Colombo 08'),
      (NULL, 'Veterinary', 'Poultry Health Officer', 120000.00, '2023-09-01', '076-4567890', '24 Temple Road, Maharagama'),
      (NULL, 'Sales', 'Marketing Executive', 110000.00, '2024-07-01', '070-5678901', '15 Nawala Road, Nugegoda')
    `);

    // Seed Buyers table with 5 entries in Sri Lankan context
    console.log("Seeding Buyers...");
    await db.execute(`
      INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES 
      ('Cargills', 'Food City', '011-7890123', 'orders@cargills.lk', '40 York Street, Colombo 01'),
      ('Keells', 'Super', '011-8901234', 'purchasing@keells.lk', 'P.O. Box 10, Colombo 10'),
      ('Arpico', 'Super Centre', '011-9012345', 'supply@arpico.lk', 'No. 310, High Level Road, Nugegoda'),
      ('New Farmers', 'Market', '011-2345670', 'info@newfarmers.lk', '75 Bauddaloka Mawatha, Colombo 07'),
      ('Laugfs', 'Supermarket', '011-3456789', 'orders@laugfs.lk', '14 Vauxhall Street, Colombo 02')
    `);

    // Seed Sellers table with 5 entries in Sri Lankan context
    console.log("Seeding Sellers...");
    await db.execute(`
      INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES 
      ('CIC', 'Feeds', '011-2345678', 'sales@cicfeeds.lk', 'CIC House, Colombo 7'),
      ('Lankan', 'Animal Health', '011-3456789', 'orders@lankahealth.lk', '15 Dharmapala Mawatha, Colombo 3'),
      ('Hayleys', 'Agriculture', '011-4567890', 'info@hayagri.lk', 'Hayleys Building, 400 Deans Road, Colombo 10'),
      ('Prima', 'Ceylon', '011-5678901', 'contact@prima.lk', 'Prima Ceylon Complex, Trincomalee'),
      ('Pussalla', 'Farms', '037-5678902', 'info@pussalla.lk', 'Pussalla Road, Rambukkana')
    `);

    // Seed Inventory with 5 entries - with current dates
    console.log("Seeding Inventory...");
    await db.execute(`
      INSERT INTO Inventory (category, item_name, quantity, unit, purchase_date, expiration_date, cost_per_unit, status) VALUES 
      ('Feed', 'Layer Crumble Feed', 750, 'kg', '2025-05-10', '2025-11-10', 165.00, 'Available'),
      ('Medication', 'Poultry Vitamins', 35, 'bottle', '2025-04-25', '2026-04-25', 950.00, 'Available'),
      ('Supplies', 'Egg Cartons', 1500, 'carton', '2025-05-15', NULL, 55.00, 'Available'),
      ('Feed', 'Chick Starter Feed', 500, 'kg', '2025-05-01', '2025-11-01', 175.00, 'Available'),
      ('Supplies', 'Bedding Material', 80, 'bag', '2025-05-05', NULL, 850.00, 'Available'),
      ('Medication', 'Antibiotics', 25, 'bottle', '2025-04-15', '2026-04-15', 1200.00, 'Available'),
      ('Feed', 'Broiler Finisher', 600, 'kg', '2025-05-12', '2025-11-12', 155.00, 'Available')
    `);

    // Seed Chicken_Records with 5 entries - realistic acquisition dates
    console.log("Seeding Chicken_Records...");
    await db.execute(`
      INSERT INTO Chicken_Records (type, breed, quantity, age_weeks, acquisition_date, notes) VALUES 
      ('Layer', 'Rhode Island Red', 200, 40, '2024-08-10', 'Productive laying hens imported from India'),
      ('Layer', 'Leghorn', 150, 35, '2024-09-15', 'High egg production suitable for Sri Lankan climate'),
      ('Broiler', 'Cobb 500', 250, 5, '2025-04-15', 'Fast growing meat birds for local market'),
      ('Breeder', 'Plymouth Rock', 100, 48, '2024-06-01', 'Quality breeding stock for chick production'),
      ('Layer', 'Black Australorp', 120, 30, '2024-10-20', 'Good dual-purpose breed adapting well to local conditions')
    `);

    // Seed Chick_Records with 5 entries - recent hatching dates
    console.log("Seeding Chick_Records...");
    await db.execute(`
      INSERT INTO Chick_Records (parent_breed, hatched_date, quantity, notes) VALUES 
      ('Plymouth Rock', '2025-05-01', 120, 'Growing well in local conditions'),
      ('Rhode Island Red', '2025-04-25', 85, 'Hatched from our best layers'),
      ('Black Australorp', '2025-05-10', 75, 'Strong batch with good survival rate'),
      ('Leghorn', '2025-04-15', 100, 'Fast growing and healthy batch'),
      ('Rhode Island Red', '2025-03-30', 90, 'Now at 7 weeks, ready for transfer')
    `);

    // Seed Egg_Records with 5 entries - recent laid dates
    console.log("Seeding Egg_Records...");
    await db.execute(`
      INSERT INTO Egg_Records (laid_date, expiration_date, quantity, size, color, notes) VALUES 
      ('2025-05-18', '2025-06-18', 450, 'Large', 'Brown', 'Fresh farm eggs for local markets'),
      ('2025-05-19', '2025-06-19', 350, 'Medium', 'White', 'From Leghorn chickens, popular in Colombo'),
      ('2025-05-17', '2025-06-17', 300, 'Large', 'Brown', 'Premium quality eggs from Rhode Island Red'),
      ('2025-05-16', '2025-06-16', 275, 'Medium', 'Brown', 'From Black Australorp, gaining popularity'),
      ('2025-05-15', '2025-06-15', 325, 'Large', 'White', 'For hotel supply chain')
    `);

    // Seed Orders with 5 entries - recent order dates
    console.log("Seeding Orders...");
    await db.execute(`
      INSERT INTO Orders (buyer_id, order_date, deadline_date, status) VALUES 
      (1, '2025-05-15', '2025-05-22', 'Completed'),
      (2, '2025-05-17', '2025-05-24', 'Ongoing'),
      (3, '2025-05-18', '2025-05-25', 'Ongoing'),
      (4, '2025-05-19', '2025-05-26', 'Ongoing'),
      (5, '2025-05-14', '2025-05-21', 'Completed')
    `);

    // Seed Order Items with 7 entries
    console.log("Seeding Order Items...");
    await db.execute(`
      INSERT INTO Order_Items (order_id, product_type, quantity, unit_price, total_price, egg_record_id, chick_record_id, chicken_record_id) VALUES 
      (1, 'Egg', 30, 45.00, 1350.00, 1, NULL, NULL),
      (1, 'Egg', 20, 40.00, 800.00, 2, NULL, NULL),
      (2, 'Egg', 40, 45.00, 1800.00, 1, NULL, NULL),
      (3, 'Chick', 35, 195.00, 6825.00, NULL, 1, NULL),
      (3, 'Chicken', 10, 1750.00, 17500.00, NULL, NULL, 3),
      (4, 'Egg', 50, 45.00, 2250.00, 3, NULL, NULL),
      (5, 'Chick', 25, 195.00, 4875.00, NULL, 2, NULL)
    `);

    // Seed Transactions with realistic dates and amounts
    console.log("Seeding Transactions...");
    await db.execute(`
      INSERT INTO Transactions (transaction_type, category, buyer_id, seller_id, amount, notes, inventory_id, chicken_record_id, egg_record_id, chick_record_id) VALUES 
      ('Income', 'Egg Sale', 1, NULL, 1350.00, 'Sale of eggs to Cargills Food City', NULL, NULL, 1, NULL),
      ('Income', 'Egg Sale', 1, NULL, 800.00, 'Additional egg sale to Cargills', NULL, NULL, 2, NULL),
      ('Income', 'Egg Sale', 2, NULL, 1800.00, 'Sale of eggs to Keells Super', NULL, NULL, 1, NULL),
      ('Income', 'Chick Sale', 3, NULL, 6825.00, 'Sale of chicks to Arpico', NULL, NULL, NULL, 1),
      ('Income', 'Chicken Sale', 3, NULL, 17500.00, 'Sale of broilers to Arpico', NULL, 3, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 1, 123750.00, 'Purchase of Layer Crumble Feed', 1, NULL, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 2, 33250.00, 'Purchase of Poultry Vitamins', 2, NULL, NULL, NULL),
      ('Expense', 'Inventory Purchase', NULL, 3, 82500.00, 'Purchase of Egg Cartons', 3, NULL, NULL, NULL),
      ('Income', 'Egg Sale', 4, NULL, 2250.00, 'Sale of eggs to New Farmers Market', NULL, NULL, 3, NULL),
      ('Income', 'Chick Sale', 5, NULL, 4875.00, 'Sale of chicks to Laugfs Supermarket', NULL, NULL, NULL, 2)
    `);

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
