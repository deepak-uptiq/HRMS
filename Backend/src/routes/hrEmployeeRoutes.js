const express = require('express');
const router = express.Router();
const hrEmployeeController = require('../controllers/hrEmployeeController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply HR/Admin authorization to all routes
router.use(authorize('HR', 'ADMIN'));

// HR Employee Management routes
router.get('/', hrEmployeeController.getAllEmployees);
router.post('/', hrEmployeeController.createEmployee);
router.get('/:id', hrEmployeeController.getEmployeeById);
router.put('/:id', hrEmployeeController.updateEmployee);
router.patch('/:id', hrEmployeeController.updateEmployee);
router.delete('/:id', hrEmployeeController.deleteEmployee);

module.exports = router;


