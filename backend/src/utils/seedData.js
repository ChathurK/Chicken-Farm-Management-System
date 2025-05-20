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

    // Seed Employees table - Fixed 10-digit contact numbers
    console.log("Seeding Employees...");
    await db.execute(`
      INSERT INTO Employees (user_id, department, position, salary, hire_date, contact_number, address) VALUES 
      (2, 'Operations', 'Farm Worker', 85000.00, '2024-01-10', '0712345678', '456 Galle Road, Panadura')
    `);

    // Seed Buyers table - Fixed 10-digit contact numbers
    console.log("Seeding Buyers...");
    await db.execute(`
      INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES 
      ('Cargills', 'Food City', '0117890123', 'orders@cargills.lk', '40 York Street, Colombo 01'),
      ('Keells', 'Super', '0118901234', 'purchasing@keells.lk', 'P.O. Box 10, Colombo 10'),
      ('Arpico', 'Super Centre', '0119012345', 'supply@arpico.lk', 'No. 310, High Level Road, Nugegoda'),
      ('New Farmers', 'Market', '0112345670', 'info@newfarmers.lk', '75 Bauddaloka Mawatha, Colombo 07'),
      ('Laugfs', 'Supermarket', '0113456789', 'orders@laugfs.lk', '14 Vauxhall Street, Colombo 02')
    `);

    // Seed Sellers table - Fixed 10-digit contact numbers
    console.log("Seeding Sellers...");
    await db.execute(`
      INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES 
      ('CIC', 'Feeds', '0112345678', 'sales@cicfeeds.lk', 'CIC House, Colombo 7'),
      ('Lankan', 'Animal Health', '0113456789', 'orders@lankahealth.lk', '15 Dharmapala Mawatha, Colombo 3'),
      ('Hayleys', 'Agriculture', '0114567890', 'info@hayagri.lk', 'Hayleys Building, 400 Deans Road, Colombo 10'),
      ('Prima', 'Ceylon', '0115678901', 'contact@prima.lk', 'Prima Ceylon Complex, Trincomalee'),
      ('Pussalla', 'Farms', '0375678902', 'info@pussalla.lk', 'Pussalla Road, Rambukkana')
    `);

    // Seed Inventory - Reduced costs to make expenses less than income
    console.log("Seeding Inventory...");
    await db.execute(`
      INSERT INTO Inventory (category, item_name, quantity, unit, purchase_date, expiration_date, cost_per_unit, status) VALUES 
      ('Feed', 'Layer Crumble Feed', 750, 'kg', '2025-02-10', '2025-08-10', 95.00, 'Available'),
      ('Medication', 'Poultry Vitamins', 35, 'bottle', '2025-01-25', '2026-01-25', 450.00, 'Available'),
      ('Supplies', 'Egg Cartons', 1500, 'carton', '2025-02-15', NULL, 25.00, 'Available'),
      ('Feed', 'Chick Starter Feed', 500, 'kg', '2025-02-01', '2025-08-01', 85.00, 'Available'),
      ('Supplies', 'Bedding Material', 80, 'bag', '2025-02-05', NULL, 350.00, 'Available'),
      ('Medication', 'Antibiotics', 25, 'bottle', '2025-01-15', '2026-01-15', 600.00, 'Available'),
      ('Feed', 'Broiler Finisher', 600, 'kg', '2025-02-12', '2025-08-12', 75.00, 'Available')
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

    // Seed Orders with 5 entries - with dates starting 3 months ago
    console.log("Seeding Orders...");
    await db.execute(`
      INSERT INTO Orders (buyer_id, order_date, deadline_date, status) VALUES 
      (1, '2025-02-15', '2025-02-22', 'Completed'),
      (2, '2025-02-27', '2025-03-06', 'Completed'),
      (3, '2025-03-18', '2025-03-25', 'Completed'),
      (4, '2025-04-19', '2025-04-26', 'Completed'),
      (5, '2025-05-14', '2025-05-21', 'Ongoing')
    `);

    // Seed Order Items with 7 entries - increased selling prices to improve profitability
    console.log("Seeding Order Items...");
    await db.execute(`
      INSERT INTO Order_Items (order_id, product_type, quantity, unit_price, total_price, egg_record_id, chick_record_id, chicken_record_id) VALUES 
      (1, 'Egg', 30, 65.00, 1950.00, 1, NULL, NULL),
      (1, 'Egg', 20, 60.00, 1200.00, 2, NULL, NULL),
      (2, 'Egg', 40, 65.00, 2600.00, 1, NULL, NULL),
      (3, 'Chick', 35, 295.00, 10325.00, NULL, 1, NULL),
      (3, 'Chicken', 10, 2250.00, 22500.00, NULL, NULL, 3),
      (4, 'Egg', 50, 65.00, 3250.00, 3, NULL, NULL),
      (5, 'Chick', 25, 295.00, 7375.00, NULL, 2, NULL)
    `);

    // Seed Transactions with dates starting 3 months ago and reduced expense amounts
    console.log("Seeding Transactions...");
    await db.execute(`
      INSERT INTO Transactions (transaction_date, transaction_type, category, buyer_id, seller_id, amount, notes, inventory_id, chicken_record_id, egg_record_id, chick_record_id) VALUES 
      ('2025-02-15', 'Income', 'Egg Sale', 1, NULL, 1950.00, 'Sale of eggs to Cargills Food City', NULL, NULL, 1, NULL),
      ('2025-02-15', 'Income', 'Egg Sale', 1, NULL, 1200.00, 'Additional egg sale to Cargills', NULL, NULL, 2, NULL),
      ('2025-02-27', 'Income', 'Egg Sale', 2, NULL, 2600.00, 'Sale of eggs to Keells Super', NULL, NULL, 1, NULL),
      ('2025-03-18', 'Income', 'Chick Sale', 3, NULL, 10325.00, 'Sale of chicks to Arpico', NULL, NULL, NULL, 1),
      ('2025-03-18', 'Income', 'Chicken Sale', 3, NULL, 22500.00, 'Sale of broilers to Arpico', NULL, 3, NULL, NULL),
      ('2025-04-02', 'Income', 'Egg Sale', 4, NULL, 21250.00, 'Sale of eggs to New Farmers Market', NULL, NULL, 3, NULL),
      ('2025-04-15', 'Income', 'Chick Sale', 5, NULL, 17775.00, 'Sale of chicks to Laugfs Supermarket', NULL, NULL, NULL, 2),
      ('2025-01-25', 'Expense', 'Inventory Purchase', NULL, 2, 15750.00, 'Purchase of Poultry Vitamins', 2, NULL, NULL, NULL),
      ('2025-04-19', 'Income', 'Egg Sale', 4, NULL, 3250.00, 'Sale of eggs to New Farmers Market', NULL, NULL, 3, NULL),
      ('2025-05-14', 'Income', 'Chick Sale', 5, NULL, 7375.00, 'Sale of chicks to Laugfs Supermarket', NULL, NULL, NULL, 2),
      ('2025-02-05', 'Expense', 'Inventory Purchase', NULL, 3, 28000.00, 'Purchase of Bedding Material', 5, NULL, NULL, NULL),
      ('2025-01-15', 'Expense', 'Inventory Purchase', NULL, 2, 15000.00, 'Purchase of Antibiotics', 6, NULL, NULL, NULL)
    `);

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
