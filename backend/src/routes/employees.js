const express = require("express");
const { check } = require("express-validator");
const employeeController = require("../controllers/employeeController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply admin middleware to all routes (only admins can manage employees)
router.use(adminMiddleware);

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/Admin
router.get("/", employeeController.getAllEmployees);

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private/Admin
router.get("/:id", employeeController.getEmployeeById);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private/Admin
router.post(
  "/",
  [
    check("first_name", "First name is required").not().isEmpty().trim().escape(),
    check("last_name", "Last name is required").not().isEmpty().trim().escape(),
    check("email", "Please include a valid email").isEmail(),
    check("department", "Department is required").not().isEmpty().trim().escape(),
    check("position", "Position is required").not().isEmpty().trim().escape(),
    check("salary", "Salary must be a positive number")
      .isNumeric()
      .custom((value) => value > 0),
    check("hire_date", "Hire date must be a valid date").optional().isISO8601().toDate(),
    check("contact_number", "Contact number is required").not().isEmpty().trim().custom((value) => {
      if (!/^[0-9\s+\-()]+$/.test(value)) {
        throw new Error(
          "Contact number must contain only digits, spaces, and the following characters: +, -, ()"
        );
      }
      return true;
    }),
  ],
  employeeController.createEmployee
);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private/Admin
router.put(
  "/:id",
  [
    check("first_name", "First name is required").not().isEmpty().trim().escape(),
    check("last_name", "Last name is required").not().isEmpty().trim().escape(),
    check("email", "Please include a valid email").isEmail(),
    check("department", "Department is required").not().isEmpty().trim().escape(),
    check("position", "Position is required").not().isEmpty().trim().escape(),
    check("salary", "Salary must be a positive number")
      .isNumeric()
      .custom((value) => value > 0),
    check("hire_date", "Hire date must be a valid date").optional().isISO8601().toDate(),
    check("contact_number", "Contact number is required").not().isEmpty().trim().custom((value) => {
      if (!/^[0-9\s+\-()]+$/.test(value)) {
        throw new Error(
          "Contact number must contain only digits, spaces, and the following characters: +, -, ()"
        );
      }
      return true;
    }),
  ],
  employeeController.updateEmployee
);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private/Admin
router.delete("/:id", employeeController.deleteEmployee);

// @route   PUT /api/employees/:id/reset-password
// @desc    Reset employee password
// @access  Private/Admin
router.put("/:id/reset-password", employeeController.resetEmployeePassword);

module.exports = router;
