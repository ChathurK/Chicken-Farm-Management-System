const db = require('../config/database');

class Egg {
    static async create({ laid_date, expiration_date, quantity, size, color, notes }) {
        const query = `INSERT INTO Egg_Records (laid_date, expiration_date, quantity, size, color, notes) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [laid_date, expiration_date, quantity, size, color, notes]);
        return result.insertId;
    }

    static async findAll() {
        const query = `SELECT * FROM Egg_Records ORDER BY egg_record_id DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM Egg_Records WHERE egg_record_id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    static async findBySizeAndColor(size, color) {
        let query = `SELECT * FROM Egg_Records WHERE 1=1`;
        const params = [];
        
        if (size) {
            query += ` AND size = ?`;
            params.push(size);
        }
        
        if (color) {
            query += ` AND color = ?`;
            params.push(color);
        }

        query += ` ORDER BY egg_record_id DESC`;
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async update(id, { laid_date, expiration_date, quantity, size, color, notes }) {
        const query = `UPDATE Egg_Records SET laid_date = ?, expiration_date = ?, quantity = ?, size = ?, color = ?, notes = ? WHERE egg_record_id = ?`;
        await db.execute(query, [laid_date, expiration_date, quantity, size, color, notes, id]);
    }

    static async delete(id) {
        const query = `DELETE FROM Egg_Records WHERE egg_record_id = ?`;
        await db.execute(query, [id]);
    }
}

module.exports = Egg;