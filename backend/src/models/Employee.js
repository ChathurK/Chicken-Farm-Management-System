const db = require("../config/database");

class Employee {
  // Create employee record
  static async create(employeeData) {
    const { user_id, department, position, salary, hire_date, contact_number, address } = employeeData;

    const query =
      "INSERT INTO Employees (user_id, department, position, salary, hire_date, contact_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await db.execute(query, [
      user_id,
      department,
      position,
      salary,
      hire_date,
      contact_number,
      address,
    ]);

    return { employee_id: result.insertId, ...employeeData };
  }

  // Find employee by user_id
  static async findByUserId(userId) {
    const query = "SELECT * FROM Employees WHERE user_id = ?";
    const [rows] = await db.execute(query, [userId]);
    return rows[0];
    }
    
  // Get all employees with user data
  static async findAllWithUserData() {
    const query = `
            SELECT e.*, u.first_name, u.last_name, u.email, u.role
            FROM Employees e
            JOIN Users u ON e.user_id = u.user_id
            WHERE u.role = 'Employee'
        `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Update employee
  static async update(userId, employeeData) {
    const { department, position, salary, hire_date, contact_number, address } = employeeData;

    const query =
      "UPDATE Employees SET department = ?, position = ?, salary = ?, hire_date = ?, contact_number = ?, address = ? WHERE user_id = ?";
    await db.execute(query, [
      department,
      position,
      salary,
      hire_date,
      contact_number,
      address,
      userId,
    ]);

    return this.findByUserId(userId);
  }

  // Delete employee (does not delete associated user)
  static async delete(userId) {
    const query = "DELETE FROM Employees WHERE user_id = ?";
    const [result] = await db.execute(query, [userId]);
    return result.affectedRows > 0;
  }

  // Check if contact number already exists
  static async findByContactNumber(contactNumber, excludeUserId = null) {
    let query = "SELECT * FROM Employees WHERE contact_number = ?";
    let params = [contactNumber];

    // If updating an employee, exclude the current employee from the check
    if (excludeUserId) {
      query += " AND user_id != ?";
      params.push(excludeUserId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = Employee;
