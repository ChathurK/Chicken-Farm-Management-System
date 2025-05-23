const db = require('../config/database');

class Order {
    // Create a new order
    static async create(orderData) {
        const {
            buyer_id,
            order_date = new Date(),
            deadline_date,
            status = 'Ongoing'
        } = orderData;

        // Start a transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert the order
            const orderQuery = `
                INSERT INTO Orders 
                (buyer_id, deadline_date, status) 
                VALUES (?, ?, ?)
            `;

            const [orderResult] = await connection.execute(orderQuery, [
                buyer_id,
                deadline_date || null,
                status
            ]);

            // Get the newly created order ID
            const order_id = orderResult.insertId;

            await connection.commit();

            // Return the created order
            return this.findById(order_id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Get all orders
    static async findAll() {
        const query = 'SELECT * FROM Orders ORDER BY order_date DESC';
        const [orders] = await db.execute(query);

        const detailedOrders = [];

        for (const order of orders) {
            // Get buyer information
            const buyerQuery = 'SELECT * FROM Buyers WHERE buyer_id = ?';
            const [buyers] = await db.execute(buyerQuery, [order.buyer_id]);
            const buyer = buyers.length > 0 ? buyers[0] : null;

            detailedOrders.push({
                ...order,
                buyer
            });
        }

        return detailedOrders;
    }

    // Find order by ID
    static async findById(id) {
        const orderQuery = 'SELECT * FROM Orders WHERE order_id = ?';
        const [orders] = await db.execute(orderQuery, [id]);

        if (orders.length === 0) {
            return null;
        }

        const order = orders[0];

        // Get order items
        const itemQuery = `
            SELECT oi.*
            FROM Order_Items oi
            WHERE oi.order_id = ?
        `;
        const [items] = await db.execute(itemQuery, [id]);

        // Get buyer information
        const buyerQuery = 'SELECT * FROM Buyers WHERE buyer_id = ?';
        const [buyers] = await db.execute(buyerQuery, [order.buyer_id]);
        const buyer = buyers.length > 0 ? buyers[0] : null;

        return {
            ...order,
            items,
            buyer
        };
    }

    // Find orders with filters
    static async findWithFilters(filters) {
        let query = 'SELECT * FROM Orders WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.buyer_id) {
            query += ' AND buyer_id = ?';
            params.push(filters.buyer_id);
        }

        if (filters.startDate) {
            query += ' AND order_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND order_date <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY order_date DESC';

        const [orders] = await db.execute(query, params);
        return orders;
    }

    // Update order
    static async update(id, orderData) {
        const {
            buyer_id,
            deadline_date,
            status
        } = orderData;

        // Get current order data
        const [currentOrder] = await db.execute('SELECT * FROM Orders WHERE order_id = ?', [id]);
        if (currentOrder.length === 0) {
            throw new Error('Order not found');
        }

        // Validate that deadline_date is after order_date
        if (deadline_date && new Date(deadline_date) <= new Date(currentOrder[0].order_date)) {
            throw new Error('Deadline date must be later than order date');
        }

        const query = `
            UPDATE Orders 
            SET buyer_id = ?, deadline_date = ?, status = ?
            WHERE order_id = ?
        `;
        
        await db.execute(query, [
            buyer_id !== undefined ? buyer_id : currentOrder[0].buyer_id,
            deadline_date !== undefined ? deadline_date : currentOrder[0].deadline_date,
            status !== undefined ? status : currentOrder[0].status,
            id
        ]);
        
        return this.findById(id);
    }
    
    // Update order status
    static async updateStatus(id, status) {
        const query = 'UPDATE Orders SET status = ? WHERE order_id = ?';
        await db.execute(query, [status, id]);
        return this.findById(id);
    }
    
    // Add order item
    static async addOrderItem(itemData) {
        const {
            order_id,
            product_type,
            quantity,
            unit_price,
            total_price,
            notes,
            chicken_record_id,
            chick_record_id,
            egg_record_id
        } = itemData;

        const query = `
            INSERT INTO Order_Items 
            (order_id, product_type, quantity, unit_price, total_price, notes, chicken_record_id, chick_record_id, egg_record_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            order_id,
            product_type,
            quantity,
            unit_price,
            total_price,
            notes,
            chicken_record_id || null,
            chick_record_id || null,
            egg_record_id || null
        ]);

        return this.getOrderItemById(result.insertId);
    }

    // Get order items
    static async getOrderItems(orderId) {
        const query = `
            SELECT oi.*
            FROM Order_Items oi
            WHERE oi.order_id = ?
        `;
        const [items] = await db.execute(query, [orderId]);
        return items;
    }

    // Get order item by ID
    static async getOrderItemById(itemId) {
        const query = 'SELECT * FROM Order_Items WHERE order_item_id = ?';
        const [items] = await db.execute(query, [itemId]);
        return items.length > 0 ? items[0] : null;
    }


    // Update order item
    static async updateOrderItem(itemId, itemData) {
        const { quantity, unit_price, total_price, notes } = itemData;

        const query = `
            UPDATE Order_Items 
            SET quantity = ?, unit_price = ?, total_price = ?, notes = ?
            WHERE order_item_id = ?
        `;

        await db.execute(query, [quantity, unit_price, total_price, notes, itemId]);
        return this.getOrderItemById(itemId);
    }

    // Remove order item
    static async removeOrderItem(itemId) {
        const query = 'DELETE FROM Order_Items WHERE order_item_id = ?';
        await db.execute(query, [itemId]);
    }

    // Delete order
    static async delete(id) {
        // Start a transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
        // Get the order items to restore inventory
            const [items] = await connection.execute(
                'SELECT * FROM Order_Items WHERE order_id = ?',
                [id]
            );

            // Delete the order (Order_Items will be deleted due to CASCADE)
            await connection.execute('DELETE FROM Orders WHERE order_id = ?', [id]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Order;