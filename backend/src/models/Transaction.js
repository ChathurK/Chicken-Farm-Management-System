const db = require('../config/database');

class Transaction {
    // Create a new transaction
    static async create(transactionData) {
        const { 
            transaction_type, 
            inventory_id, 
            buyer_id, 
            seller_id, 
            amount, 
            description 
        } = transactionData;
        
        const query = `
            INSERT INTO Transactions (
                transaction_type, inventory_id, buyer_id, seller_id, amount, description
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            transaction_type,
            inventory_id || null,
            buyer_id || null,
            seller_id || null,
            amount,
            description || null
        ]);
        
        return { transaction_id: result.insertId, ...transactionData };
    }
    
    // Find transaction by ID
    static async findById(id) {
        const query = `
            SELECT t.*, 
                   i.item_name, i.category,
                   CONCAT(b.first_name, ' ', b.last_name) as buyer_name,
                   CONCAT(s.first_name, ' ', s.last_name) as seller_name
            FROM Transactions t
            LEFT JOIN Inventory i ON t.inventory_id = i.inventory_id
            LEFT JOIN Buyers b ON t.buyer_id = b.buyer_id
            LEFT JOIN Sellers s ON t.seller_id = s.seller_id
            WHERE t.transaction_id = ?
        `;
        
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // Get all transactions
    static async findAll() {
        const query = `
            SELECT t.*, 
                   i.item_name, i.category,
                   CONCAT(b.first_name, ' ', b.last_name) as buyer_name,
                   CONCAT(s.first_name, ' ', s.last_name) as seller_name
            FROM Transactions t
            LEFT JOIN Inventory i ON t.inventory_id = i.inventory_id
            LEFT JOIN Buyers b ON t.buyer_id = b.buyer_id
            LEFT JOIN Sellers s ON t.seller_id = s.seller_id
            ORDER BY t.transaction_date DESC
        `;
        
        const [rows] = await db.execute(query);
        return rows;
    }

    // Get transactions with filters
    static async findWithFilters(filters) {
        let query = `
            SELECT t.*, 
                   i.item_name, i.category,
                   CONCAT(b.first_name, ' ', b.last_name) as buyer_name,
                   CONCAT(s.first_name, ' ', s.last_name) as seller_name
            FROM Transactions t
            LEFT JOIN Inventory i ON t.inventory_id = i.inventory_id
            LEFT JOIN Buyers b ON t.buyer_id = b.buyer_id
            LEFT JOIN Sellers s ON t.seller_id = s.seller_id
            WHERE 1=1
        `;
        
        const params = [];

        if (filters.transaction_type) {
            query += ' AND t.transaction_type = ?';
            params.push(filters.transaction_type);
        }
        
        if (filters.buyer_id) {
            query += ' AND t.buyer_id = ?';
            params.push(filters.buyer_id);
        }
        
        if (filters.seller_id) {
            query += ' AND t.seller_id = ?';
            params.push(filters.seller_id);
        }

        if (filters.inventory_id) {
            query += ' AND t.inventory_id = ?';
            params.push(filters.inventory_id);
        }

        if (filters.startDate) {
            query += ' AND t.transaction_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND t.transaction_date <= ?';
            params.push(filters.endDate);
        }

        if (filters.minAmount) {
            query += ' AND t.amount >= ?';
            params.push(filters.minAmount);
        }

        if (filters.maxAmount) {
            query += ' AND t.amount <= ?';
            params.push(filters.maxAmount);
        }

        query += ' ORDER BY t.transaction_date DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await db.execute(query, params);
        return rows;
    }
    
    // Update transaction
    static async update(id, transactionData) {
        const { 
            transaction_type, 
            inventory_id, 
            buyer_id, 
            seller_id, 
            amount, 
            description 
        } = transactionData;
        
        const query = `
            UPDATE Transactions 
            SET transaction_type = ?, 
                inventory_id = ?, 
                buyer_id = ?, 
                seller_id = ?, 
                amount = ?, 
                description = ? 
            WHERE transaction_id = ?
        `;
        
        await db.execute(query, [
            transaction_type,
            inventory_id || null,
            buyer_id || null,
            seller_id || null,
            amount,
            description || null,
            id
        ]);
        
        return { transaction_id: id, ...transactionData };
    }
    
    // Delete transaction
    static async delete(id) {
        const query = 'DELETE FROM Transactions WHERE transaction_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Get financial summary for dashboard
    static async getFinancialSummary(period = 'month') {
        let dateFilter;
        
        switch(period) {
            case 'week':
                dateFilter = 'AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 WEEK)';
                break;
            case 'month':
                dateFilter = 'AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)';
                break;
            case 'quarter':
                dateFilter = 'AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)';
                break;
            case 'year':
                dateFilter = 'AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)';
                break;
            default:
                dateFilter = '';
        }

        const query = `
            SELECT 
                SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as total_expense,
                SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) as profit
            FROM Transactions
            WHERE 1=1 ${dateFilter}
        `;
        
        const [rows] = await db.execute(query);
        return rows[0];
    }
}

module.exports = Transaction;