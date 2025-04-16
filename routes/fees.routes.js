const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getStudentFees,
  createFeePayment,
  verifyPayment,
  generateReceipt
} = require('../controllers/fees.controller');
const {
  feeStructureSchema,
  paymentSchema
} = require('../validations/fee.validation');

// All routes protected
router.use(auth);

// Fee structure management (admin only)
router.get('/structures', role('admin'), getFeeStructures);
router.post('/structures', role('admin'), validate(feeStructureSchema), createFeeStructure);
router.patch('/structures/:id', role('admin'), validate(feeStructureSchema), updateFeeStructure);
router.delete('/structures/:id', role('admin'), deleteFeeStructure);

// Student fee operations
router.get('/student/:studentId', role('admin', 'teacher', 'parent'), getStudentFees);
router.post('/pay', role('parent'), validate(paymentSchema), createFeePayment);
router.post('/verify', role('admin'), validate(paymentSchema), verifyPayment);
router.get('/receipt/:paymentId', role('admin', 'parent'), generateReceipt);

module.exports = router;