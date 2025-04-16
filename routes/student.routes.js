const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentFees,
  getStudentAttendance,
  getStudentHomework,
  getStudentPerformance
} = require('../controllers/student.controller');
const {
  createStudentSchema,
  updateStudentSchema
} = require('../validations/student.validation');

// All routes protected
router.use(auth);

// Admin/teacher routes
router.get('/', role('admin', 'teacher'), getStudents);
router.post('/', role('admin'), validate(createStudentSchema), createStudent);

// Student-specific routes
router.get('/:id', role('admin', 'teacher', 'parent'), getStudent);
router.patch('/:id', role('admin'), validate(updateStudentSchema), updateStudent);
router.delete('/:id', role('admin'), deleteStudent);

// Student details
router.get('/:id/fees', role('admin', 'teacher', 'parent'), getStudentFees);
router.get('/:id/attendance', role('admin', 'teacher', 'parent'), getStudentAttendance);
router.get('/:id/homework', role('admin', 'teacher', 'parent', 'student'), getStudentHomework);
router.get('/:id/performance', role('admin', 'teacher', 'parent'), getStudentPerformance);

module.exports = router;