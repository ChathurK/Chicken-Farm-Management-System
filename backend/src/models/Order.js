const db = require('../config/database');

class Order {
    // Create a new order
    static async create(orderData) {
        const { buyer_id, deadline_date, status } = orderData;
        
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Create order
            const query = 'INSERT INTO Orders (buyer_id, deadline_date, status) VALUES (?, ?, ?)';
            const [result] = await connection.execute(query, [
                buyer_id, 
                deadline_date, 
                status || 'Ongoing'
            ]);
            
            await connection.commit();
            connection.release();
            
            return { order_id: result.insertId, ...orderData };
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }
    
    // Find order by ID
    static async findById(id) {
        const query = `
            SELECT o.*, b.full_name as buyer_name, b.contact_number as buyer_contact 
            FROM Orders o
            JOIN Buyers b ON o.buyer_id = b.buyer_id
            WHERE o.order_id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // Get all orders
    static async findAll() {
        const query = `
            SELECT o.*, b.full_name as buyer_name, 
                   COUNT(oi.order_item_id) as total_items,
                   SUM(oi.total_price) as order_total
            FROM Orders o
            JOIN Buyers b ON o.buyer_id = b.buyer_id
            LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
            GROUP BY o.order_id
            ORDER BY o.order_date DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get orders with filters (by status, date range)
    static async findWithFilters(filters) {
        let query = `
            SELECT o.*, b.full_name as buyer_name, 
                   COUNT(oi.order_item_id) as total_items,
                   SUM(oi.total_price) as order_total
            FROM Orders o
            JOIN Buyers b ON o.buyer_id = b.buyer_id
            LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
            WHERE 1=1
        `;
        
        const params = [];

        if (filters.status) {
            query += ' AND o.status = ?';
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += ' AND o.order_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND o.order_date <= ?';
            params.push(filters.endDate);
        }

        if (filters.buyer_id) {
            query += ' AND o.buyer_id = ?';
            params.push(filters.buyer_id);
        }

        query += ' GROUP BY o.order_id ORDER BY o.order_date DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    }
    
    // Update order
    static async update(id, orderData) {
        const { buyer_id, deadline_date, status } = orderData;
        
        const query = 'UPDATE Orders SET buyer_id = ?, deadline_date = ?, status = ? WHERE order_id = ?';
        await db.execute(query, [buyer_id, deadline_date, status, id]);
        
        return { order_id: id, ...orderData };
    }
    
    // Update order status
    static async updateStatus(id, status) {
        const query = 'UPDATE Orders SET status = ? WHERE order_id = ?';
        await db.execute(query, [status, id]);
        
        return { order_id: id, status };
    }
    
    // Delete order
    static async delete(id) {
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // First delete all order items
            await connection.execute('DELETE FROM Order_Items WHERE order_id = ?', [id]);
            
            // Then delete the order
            const [result] = await connection.execute('DELETE FROM Orders WHERE order_id = ?', [id]);
            
            await connection.commit();
            connection.release();
            
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    // Add item to order
    static async addOrderItem(orderItemData) {
        const { order_id, inventory_id, quantity, unit_price } = orderItemData;
        
        const query = 'INSERT INTO Order_Items (order_id, inventory_id, quantity, unit_price) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [order_id, inventory_id, quantity, unit_price]);
        
        return { order_item_id: result.insertId, ...orderItemData };
    }

    // Get all items for an order
    static async getOrderItems(orderId) {
        const query = `
            SELECT oi.*, i.item_name, i.category, i.unit
            FROM Order_Items oi
            JOIN Inventory i ON oi.inventory_id = i.inventory_id
            WHERE oi.order_id = ?
        `;
        const [rows] = await db.execute(query, [orderId]);
        return rows;
    }

    // Update order item
    static async updateOrderItem(itemId, orderItemData) {
        const { quantity, unit_price } = orderItemData;
        
        const query = 'UPDATE Order_Items SET quantity = ?, unit_price = ? WHERE order_item_id = ?';
        await db.execute(query, [quantity, unit_price, itemId]);
        
        return { order_item_id: itemId, ...orderItemData };
    }

    // Remove item from order
    static async removeOrderItem(itemId) {
        const query = 'DELETE FROM Order_Items WHERE order_item_id = ?';
        const [result] = await db.execute(query, [itemId]);
        return result.affectedRows > 0;
    }
}

module.exports = Order;