const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  getProfile,
  changePassword
} = require('../controllers/user.controller');
const {
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('../validations/user.validation');

// All routes protected
router.use(auth);

// User management routes (admin only)
router.get('/', role('admin'), getUsers);
router.get('/:id', role('admin'), getUser);
router.patch('/:id', role('admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', role('admin'), deleteUser);

// Profile routes
router.get('/me/profile', getProfile);
router.patch('/me/profile', validate(updateProfileSchema), updateProfile);

// Password change
router.patch('/me/change-password', validate(changePasswordSchema), changePassword);

module.exports = router;