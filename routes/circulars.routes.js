const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createCircular,
  getCirculars,
  getCircularById,
  updateCircular,
  deleteCircular,
  markAsRead
} = require('../controllers/circulars.controller');
const {
  createCircularSchema,
  updateCircularSchema,
  getCircularsSchema
} = require('../validations/circular.validation');

// All routes protected
router.use(auth);

// Admin/teacher routes
router.post('/', role('admin', 'teacher'), validate(createCircularSchema), createCircular);
router.patch('/:id', role('admin', 'teacher'), validate(updateCircularSchema), updateCircular);
router.delete('/:id', role('admin', 'teacher'), deleteCircular);

// All authenticated users can access these
router.get('/', validate(getCircularsSchema), getCirculars);
router.get('/:id', getCircularById);
router.post('/:id/read', markAsRead);

module.exports = router;