const db = require('../config/database');

class Chicken {
    static async create({ type, breed, quantity, age_weeks, acquisition_date, notes }) {
        const query = `INSERT INTO Chicken_Records (type, breed, quantity, age_weeks, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [type, breed, quantity, age_weeks, acquisition_date, notes]);
        return result.insertId;
    }

    static async findAll() {
        const query = `SELECT * FROM Chicken_Records ORDER BY chicken_record_id DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM Chicken_Records WHERE chicken_record_id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    static async findByTypeAndBreed(type, breed) {
        let query = `SELECT * FROM Chicken_Records WHERE 1=1`;
        const params = [];
        
        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }
        
        if (breed) {
            query += ` AND breed = ?`;
            params.push(breed);
        }

        query += ` ORDER BY chicken_record_id DESC`;
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async update(id, { type, breed, quantity, age_weeks, acquisition_date, notes }) {
        const query = `UPDATE Chicken_Records SET type = ?, breed = ?, quantity = ?, age_weeks = ?, acquisition_date = ?, notes = ? WHERE chicken_record_id = ?`;
        await db.execute(query, [type, breed, quantity, age_weeks, acquisition_date, notes, id]);
    }

    static async delete(id) {
        const query = `DELETE FROM Chicken_Records WHERE chicken_record_id = ?`;
        await db.execute(query, [id]);
    }
}

module.exports = Chicken;