const db = require("../config/database");

class Buyer {
  // Create a new buyer
  static async create(buyerData) {
    try {
      const { first_name, last_name, contact_number, email, address } =
        buyerData;

      const query =
        "INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES (?, ?, ?, ?, ?)";
      const [result] = await db.execute(query, [
        first_name,
        last_name,
        contact_number,
        email,
        address,
      ]);

      return { buyer_id: result.insertId, ...buyerData };
    } catch (error) {
      console.error(error.message);
      // Handle specific MySQL errors
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("contact_number")) {
          throw new Error("Contact number already exists");
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  // Find buyer by ID
  static async findById(id) {
    try {
      const query = "SELECT * FROM Buyers WHERE buyer_id = ?";
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("Error finding buyer by ID:", error);
      throw error;
    }
  }

  // Find buyer by email
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM Buyers WHERE email = ?";
      const [rows] = await db.execute(query, [email]);
      return rows[0];
    } catch (error) {
      console.error("Error finding buyer by email:", error);
      throw error;
    }
  }

  // Get all buyers
  static async findAll() {
    try {
      const query =
        "SELECT * FROM Buyers";
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error("Error finding all buyers:", error);
      throw error;
    }
  }

  // Update buyer
  static async update(id, buyerData) {
    try {
      const { first_name, last_name, contact_number, email, address } =
        buyerData;

      const query =
        "UPDATE Buyers SET first_name = ?, last_name = ?, contact_number = ?, email = ?, address = ? WHERE buyer_id = ?";
      const [result] = await db.execute(query, [
        first_name,
        last_name,
        contact_number,
        email,
        address,
        id,
      ]);

      if (result.affectedRows === 0) {
        throw new Error("Buyer not found");
      }

      return { buyer_id: id, ...buyerData };
    } catch (error) {
      // Handle specific MySQL errors
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("contact_number")) {
          throw new Error("Contact number already exists");
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  // Delete buyer
  static async delete(id) {
    try {
      const query = "DELETE FROM Buyers WHERE buyer_id = ?";
      const [result] = await db.execute(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error("Buyer not found");
      }

      return result.affectedRows > 0;
    } catch (error) {
      // Check if error is related to foreign key constraints
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error(
          "Cannot delete buyer because they have related orders or transactions"
        );
      }
      throw error;
    }
  }

  // Get buyer's order history
  static async getOrderHistory(buyerId) {
    try {
      const query = `
                SELECT o.*, 
                       COUNT(oi.order_item_id) as total_items,
                       SUM(oi.total_price) as order_total
                FROM Orders o
                LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.buyer_id = ?
                GROUP BY o.order_id
                ORDER BY o.order_date DESC
            `;

      const [rows] = await db.execute(query, [buyerId]);
      return rows;
    } catch (error) {
      console.error("Error getting buyer order history:", error);
      throw error;
    }
  }
}

module.exports = Buyer;
