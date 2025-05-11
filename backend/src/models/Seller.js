const db = require("../config/database");

class Seller {
  // Create a new seller
  static async create(sellerData) {
    try {
      const { first_name, last_name, contact_number, email, address } =
        sellerData;

      const query =
        "INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES (?, ?, ?, ?, ?)";
      const [result] = await db.execute(query, [
        first_name,
        last_name,
        contact_number,
        email,
        address,
      ]);

      return { seller_id: result.insertId, ...sellerData };
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

  // Find seller by ID
  static async findById(id) {
    try {
      const query = "SELECT * FROM Sellers WHERE seller_id = ?";
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("Error finding seller by ID:", error);
      throw error;
    }
  }

  // Find seller by email
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM Sellers WHERE email = ?";
      const [rows] = await db.execute(query, [email]);
      return rows[0];
    } catch (error) {
      console.error("Error finding seller by email:", error);
      throw error;
    }
  }

  // Get all sellers
  static async findAll() {
    try {
      const query =
        "SELECT * FROM Sellers";
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error("Error finding all sellers:", error);
      throw error;
    }
  }

  // Update seller
  static async update(id, sellerData) {
    try {
      const { first_name, last_name, contact_number, email, address } =
        sellerData;

      const query =
        "UPDATE Sellers SET first_name = ?, last_name = ?, contact_number = ?, email = ?, address = ? WHERE seller_id = ?";
      const [result] = await db.execute(query, [
        first_name,
        last_name,
        contact_number,
        email,
        address,
        id,
      ]);

      if (result.affectedRows === 0) {
        throw new Error("Seller not found");
      }

      return { seller_id: id, ...sellerData };
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

  // Delete seller
  static async delete(id) {
    try {
      const query = "DELETE FROM Sellers WHERE seller_id = ?";
      const [result] = await db.execute(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error("Seller not found");
      }

      return result.affectedRows > 0;
    } catch (error) {
      // Check if error is related to foreign key constraints
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error(
          "Cannot delete seller because they have related transactions"
        );
      }
      throw error;
    }
  }

  // Get transaction history with this seller
  static async getTransactionHistory(sellerId) {
    try {
      const query = `
                SELECT t.*, i.item_name, i.category
                FROM Transactions t
                LEFT JOIN Inventory i ON t.inventory_id = i.inventory_id
                WHERE t.seller_id = ?
                ORDER BY t.transaction_date DESC
            `;

      const [rows] = await db.execute(query, [sellerId]);
      return rows;
    } catch (error) {
      console.error("Error getting seller transaction history:", error);
      throw error;
    }
  }
}

module.exports = Seller;
