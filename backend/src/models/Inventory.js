const db = require('../config/database');

class Inventory {
    // Create a new inventory item
    static async create(item) {
        const {
            category,
            item_name,
            quantity,
            unit,
            purchase_date,
            expiration_date,
            cost_per_unit,
            status
        } = item;

        // Validate category
        if (!['Feed', 'Medication', 'Supplies', 'Other'].includes(category)) {
            throw new Error('Invalid category. Must be Feed, Medication, Supplies, or Other');
        }

        // Validate status
        if (!['Available', 'Low', 'Finished', 'Expired'].includes(status)) {
            throw new Error('Invalid status. Must be Available, Low, Finished, or Expired');
        }

        const query = `
            INSERT INTO Inventory 
            (category, item_name, quantity, unit, purchase_date, expiration_date, cost_per_unit, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            category,
            item_name,
            quantity,
            unit,
            purchase_date || null,
            expiration_date || null,
            cost_per_unit || 0.00,
            status || 'Available'
        ]);

        return { inventory_id: result.insertId, ...item };
    }

    // Find inventory item by ID
    static async findById(id) {
        const query = 'SELECT * FROM Inventory WHERE inventory_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Find inventory items by category
    static async findByCategory(category) {
        const query = 'SELECT * FROM Inventory WHERE category = ? ORDER BY item_name';
        const [rows] = await db.execute(query, [category]);
        return rows;
    }

    // Get all inventory items
    static async findAll() {
        const query = 'SELECT * FROM Inventory ORDER BY category, item_name';
        const [rows] = await db.execute(query);
        return rows;
    }

    // Search inventory items
    static async search(searchTerm) {
        const query = `
            SELECT * FROM Inventory 
            WHERE item_name LIKE ? OR category LIKE ?
            ORDER BY category, item_name
        `;
        const searchParam = `%${searchTerm}%`;
        const [rows] = await db.execute(query, [searchParam, searchParam]);
        return rows;
    }

    // Find inventory items with filters
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
            const date = new Date();
            date.setDate(date.getDate() + 30); // Items expiring in next 30 days
            query += ' AND expiration_date IS NOT NULL AND expiration_date <= ? AND status != "Expired"';
            params.push(date.toISOString().split('T')[0]);
        }

        if (filters.lowStock) {
            query += ' AND status = "Low"';
        }

        query += ' ORDER BY category, item_name';
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Update inventory item
    static async update(id, item) {
        const {
            category,
            item_name,
            quantity,
            unit,
            purchase_date,
            expiration_date,
            cost_per_unit,
            status
        } = item;

        // Validate category
        if (category && !['Feed', 'Medication', 'Supplies', 'Other'].includes(category)) {
            throw new Error('Invalid category. Must be Feed, Medication, Supplies, or Other');
        }

        // Validate status
        if (status && !['Available', 'Low', 'Finished', 'Expired'].includes(status)) {
            throw new Error('Invalid status. Must be Available, Low, Finished, or Expired');
        }

        // Get current inventory data
        const [currentItem] = await db.execute('SELECT * FROM Inventory WHERE inventory_id = ?', [id]);
        if (currentItem.length === 0) {
            throw new Error('Inventory item not found');
        }

        const query = `
            UPDATE Inventory 
            SET category = ?, item_name = ?, quantity = ?, unit = ?, 
                purchase_date = ?, expiration_date = ?, cost_per_unit = ?, status = ?
            WHERE inventory_id = ?
        `;

        await db.execute(query, [
            category || currentItem[0].category,
            item_name || currentItem[0].item_name,
            quantity !== undefined ? quantity : currentItem[0].quantity,
            unit || currentItem[0].unit,
            purchase_date !== undefined ? purchase_date : currentItem[0].purchase_date,
            expiration_date !== undefined ? expiration_date : currentItem[0].expiration_date,
            cost_per_unit !== undefined ? cost_per_unit : currentItem[0].cost_per_unit,
            status || currentItem[0].status,
            id
        ]);

        return this.findById(id);
    }

    // Update inventory quantity
    static async updateQuantity(id, quantity) {
        const [currentItem] = await db.execute('SELECT * FROM Inventory WHERE inventory_id = ?', [id]);
        if (currentItem.length === 0) {
            throw new Error('Inventory item not found');
        }

        const query = 'UPDATE Inventory SET quantity = ? WHERE inventory_id = ?';
        await db.execute(query, [quantity, id]);
        
        return this.findById(id);
    }

    // Update inventory status
    static async updateStatus(id, status) {
        // Validate status
        if (!['Available', 'Low', 'Finished', 'Expired'].includes(status)) {
            throw new Error('Invalid status. Must be Available, Low, Finished, or Expired');
        }

        const query = 'UPDATE Inventory SET status = ? WHERE inventory_id = ?';
        await db.execute(query, [status, id]);
        
        return this.findById(id);
    }

    // Delete inventory item
    static async delete(id) {
        const query = 'DELETE FROM Inventory WHERE inventory_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Get low stock items
    static async getLowStock() {
        const query = 'SELECT * FROM Inventory WHERE status = "Low" ORDER BY category, item_name';
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get expiring items
    static async getExpiring(daysUntilExpiry = 30) {
        const date = new Date();
        date.setDate(date.getDate() + daysUntilExpiry);
        
        const query = `
            SELECT * FROM Inventory 
            WHERE expiration_date IS NOT NULL AND expiration_date <= ? AND status != 'Expired'
            ORDER BY expiration_date
        `;
        
        const [rows] = await db.execute(query, [date.toISOString().split('T')[0]]);
        return rows;
    }
}

module.exports = Inventory;