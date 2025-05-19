const db = require('../config/database');

class Chick {
    static async create({ parent_breed, hatched_date, quantity, notes }) {
        const query = `INSERT INTO Chick_Records (parent_breed, hatched_date, quantity, notes) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [parent_breed, hatched_date, quantity, notes]);
        return result.insertId;
    }

    static async findAll() {
        const query = `SELECT * FROM Chick_Records ORDER BY chick_record_id DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM Chick_Records WHERE chick_record_id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    static async findByParentBreed(parent_breed) {
        let query = `SELECT * FROM Chick_Records WHERE 1=1`;
        const params = [];
        
        if (parent_breed) {
            query += ` AND parent_breed = ?`;
            params.push(parent_breed);
        }

        query += ` ORDER BY chick_record_id DESC`;
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async update(id, { parent_breed, hatched_date, quantity, notes }) {
        const query = `UPDATE Chick_Records SET parent_breed = ?, hatched_date = ?, quantity = ?, notes = ? WHERE chick_record_id = ?`;
        await db.execute(query, [parent_breed, hatched_date, quantity, notes, id]);
    }

    static async delete(id) {
        const query = `DELETE FROM Chick_Records WHERE chick_record_id = ?`;
        await db.execute(query, [id]);
    }
}

module.exports = Chick;