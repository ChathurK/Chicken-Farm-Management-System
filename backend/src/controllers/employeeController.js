const User = require("../models/User");
const Employee = require("../models/Employee");
const { validationResult } = require("express-validator");
const db = require("../config/database");
const bcrypt = require("bcrypt");

// @desc    Get all employees with user data
// @route   GET /api/employees
// @access  Private/Admin
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAllWithUserData();
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get employee by user ID
// @route   GET /api/employees/:id
// @access  Private/Admin
exports.getEmployeeById = async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get employee data
    const employee = await Employee.findByUserId(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    res.json({
      user,
      employee,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Create employee (both user account and employee record)
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array().map(error => error.msg).join(", ") });
    }

    const {
      // User data
      first_name,
      last_name,
      email,
      // Employee data
      department,
      position,
      salary,
      hire_date = new Date().toISOString().split("T")[0],
      contact_number,
      address,
    } = req.body; // Generate a temporary password (or use a provided one)
    const temporaryPassword = req.body.password || generateTemporaryPassword();

    // Check if user already exists
    let existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    // Check if contact number already exists
    const existingContact = await Employee.findByContactNumber(contact_number);
    if (existingContact) {
      return res
        .status(400)
        .json({ msg: "An employee with this contact number already exists" });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Create user account with Employee role
      const user = await User.create({
        first_name,
        last_name,
        email,
        password: temporaryPassword,
        role: "Employee",
      });

      // 2. Create employee record
      const employee = await Employee.create({
        user_id: user.user_id,
        department,
        position,
        salary,
        hire_date,
        contact_number,
        address,
      });

      await connection.commit();

      // Return created employee (without password in production)
      const response = {
        user: {
          user_id: user.user_id,
          first_name,
          last_name,
          email,
          role: "Employee",
        },
        employee: {
          department,
          position,
          salary,
          hire_date,
          contact_number,
          address,
        },
        temporaryPassword, // Include this for the admin to give to the employee
      };

      res.status(201).json(response);
    } catch (error) {
      await connection.rollback();
      console.error(error.message);

      // Determine specific error type for better error messages
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("contact_number")) {
          return res.status(400).json({
            msg: "An employee with this contact number already exists",
          });
        } else if (error.message.includes("email")) {
          return res.status(400).json({
            msg: "User with this email already exists",
          });
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error", details: err.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array().map(error => error.msg).join(", ") });
    }

    const userId = req.params.id;
    const {
      // User data (if provided)
      first_name,
      last_name,
      email,
      // Employee data
      department,
      position,
      salary,
      contact_number,
      address,
    } = req.body;

    // Check if email already exists (if trying to change email)
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.user_id != userId) {
        return res.status(400).json({
          msg: "Email address is already in use by another account",
        });
      }
    }

    // Check if contact number already exists (excluding current employee)
    if (contact_number) {
      const existingContact = await Employee.findByContactNumber(
        contact_number,
        userId
      );
      if (existingContact) {
        return res.status(400).json({
          msg: "An employee with this contact number already exists",
        });
      }
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update user info if provided
      let userUpdateData = {};
      let userUpdated = false;

      if (first_name || last_name || email) {
        userUpdateData = {
          ...(first_name && { first_name }),
          ...(last_name && { last_name }),
          ...(email && { email }),
        };

        await User.update(userId, userUpdateData);
        userUpdated = true;
      }

      // Update employee info
      const employeeData = {
        department,
        position,
        salary,
        contact_number,
        address,
      };

      const updatedEmployee = await Employee.update(userId, employeeData);

      await connection.commit();

      // Get updated user data for response
      const userData = userUpdated
        ? await User.findById(userId)
        : await User.findById(userId);

      res.json({
        user: userData,
        employee: updatedEmployee,
      });
    } catch (error) {
      await connection.rollback();

      // Handle specific error types
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("contact_number")) {
          return res.status(400).json({
            msg: "An employee with this contact number already exists",
          });
        } else if (error.message.includes("email")) {
          return res.status(400).json({
            msg: "Email address is already in use by another account",
          });
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err.message);

    // Check for duplicate entry errors from MySQL
    if (
      err.message &&
      err.message.includes("Duplicate entry") &&
      err.message.includes("email")
    ) {
      return res
        .status(400)
        .json({ msg: "Email address is already in use by another account" });
    } else if (
      err.message &&
      err.message.includes("Duplicate entry") &&
      err.message.includes("contact_number")
    ) {
      return res
        .status(400)
        .json({ msg: "An employee with this contact number already exists" });
    }

    res.status(500).json({ msg: "Server Error", details: err.message });
  }
};

// @desc    Delete employee and user
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if employee exists
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Delete employee record first (due to foreign key constraint)
      await Employee.delete(userId);

      // Delete user record
      await User.delete(userId);

      await connection.commit();

      res.json({ msg: "Employee removed successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Reset employee password
// @route   PUT /api/employees/:id/reset-password
// @access  Private/Admin
exports.resetEmployeePassword = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists and is an employee
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== "Employee") {
      return res.status(400).json({ msg: "User is not an employee" });
    }

    // Generate new password
    const newPassword = generateTemporaryPassword();

    // Update password
    await User.updatePassword(userId, newPassword);

    res.json({
      msg: "Password reset successful",
      temporaryPassword: newPassword,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Helper function to generate a temporary password
function generateTemporaryPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
