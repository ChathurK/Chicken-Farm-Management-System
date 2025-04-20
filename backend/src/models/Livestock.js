const db = require('../config/database');

class Livestock {
    static async create({ type, total_quantity, status }) {
        const query = `INSERT INTO Livestock (type, total_quantity, status) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [type, total_quantity, status]);
        return result.insertId;
    }

    static async findById(id) {
        const query = `SELECT * FROM Livestock WHERE livestock_id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    static async findAll() {
        const query = `SELECT * FROM Livestock`;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async updateQuantity(id, newQuantity) {
        const query = `UPDATE Livestock SET total_quantity = ? WHERE livestock_id = ?`;
        await db.execute(query, [newQuantity, id]);
    }

    static async update(id, { type, total_quantity, status }) {
        let query = `UPDATE Livestock SET `;
        const params = [];
        const updateFields = [];
        
        if (type !== undefined) {
            updateFields.push(`type = ?`);
            params.push(type);
        }
        
        if (total_quantity !== undefined) {
            updateFields.push(`total_quantity = ?`);
            params.push(total_quantity);
        }
        
        if (status !== undefined) {
            updateFields.push(`status = ?`);
            params.push(status);
        }
        
        query += updateFields.join(', ') + ` WHERE livestock_id = ?`;
        params.push(id);
        
        await db.execute(query, params);
    }

    static async delete(id) {
        const query = `DELETE FROM Livestock WHERE livestock_id = ?`;
        await db.execute(query, [id]);
    }
}

module.exports = Livestock;