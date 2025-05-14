const db = require('../config/database');

class Chicken {
    static async create({ type, breed, quantity, age_weeks, acquisition_date, notes }) {
        const query = `INSERT INTO Chicken_Records (type, breed, quantity, age_weeks, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [type, breed, quantity, age_weeks, acquisition_date, notes]);
        return result.insertId;
    }

    static async findById(id) {
        const query = `SELECT * FROM Chicken_Records WHERE chicken_record_id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
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