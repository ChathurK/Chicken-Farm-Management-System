const db = require('../config/database');

class Inventory {
    // Create a new inventory item
    static async create(inventoryData) {
        const { 
            category, 
            item_name, 
            batch_number, 
            quantity, 
            unit, 
            purchase_date, 
            expiration_date,
            cost_per_unit,
            total_cost,
            status
        } = inventoryData;
        
        const query = `
            INSERT INTO Inventory (
                category, item_name, batch_number, quantity, unit, 
                purchase_date, expiration_date, cost_per_unit, total_cost, status
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            category, 
            item_name, 
            batch_number, 
            quantity, 
            unit, 
            purchase_date || null, 
            expiration_date || null,
            cost_per_unit || 0,
            total_cost || 0,
            status || 'Available'
        ]);
        
        return { inventory_id: result.insertId, ...inventoryData };
    }
    
    // Find inventory item by ID
    static async findById(id) {
        const query = 'SELECT * FROM Inventory WHERE inventory_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Find by category
    static async findByCategory(category) {
        const query = 'SELECT * FROM Inventory WHERE category = ? AND status = "Available"';
        const [rows] = await db.execute(query, [category]);
        return rows;
    }
    
    // Get all inventory items
    static async findAll() {
        const query = 'SELECT * FROM Inventory ORDER BY created_at DESC';
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get inventory items with filters
    static async findWithFilters(filters) {
        let query = 'SELECT * FROM Inventory WHERE 1=1';
        const params = [];

        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.expiringSoon) {
            query += ' AND expiration_date IS NOT NULL AND expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';
        }

        if (filters.lowStock) {
            query += ' AND quantity <= 10'; // Assuming 10 as low stock threshold
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    }
    
    // Update inventory item
    static async update(id, inventoryData) {
        const { 
            category, 
            item_name, 
            batch_number, 
            quantity, 
            unit, 
            purchase_date, 
            expiration_date,
            cost_per_unit,
            total_cost,
            status 
        } = inventoryData;
        
        const query = `
            UPDATE Inventory 
            SET category = ?, 
                item_name = ?, 
                batch_number = ?, 
                quantity = ?, 
                unit = ?, 
                purchase_date = ?, 
                expiration_date = ?,
                cost_per_unit = ?,
                total_cost = ?,
                status = ? 
            WHERE inventory_id = ?
        `;

        await db.execute(query, [
            category, 
            item_name, 
            batch_number, 
            quantity, 
            unit, 
            purchase_date || null, 
            expiration_date || null,
            cost_per_unit || 0,
            total_cost || 0,
            status || 'Available',
            id
        ]);
        
        return { inventory_id: id, ...inventoryData };
    }
    
    // Update inventory status
    static async updateStatus(id, status) {
        const query = 'UPDATE Inventory SET status = ? WHERE inventory_id = ?';
        await db.execute(query, [status, id]);
        return { inventory_id: id, status };
    }
    
    // Update inventory quantity
    static async updateQuantity(id, quantity) {
        const query = 'UPDATE Inventory SET quantity = ? WHERE inventory_id = ?';
        await db.execute(query, [quantity, id]);
        
        // Get updated inventory item
        return await this.findById(id);
    }
    
    // Delete inventory item
    static async delete(id) {
        const query = 'DELETE FROM Inventory WHERE inventory_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Inventory;