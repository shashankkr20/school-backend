const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  recordAttendance,
  getAttendance,
  updateAttendance,
  getStudentAttendance,
  getClassAttendance,
  generateReport
} = require('../controllers/attendance.controller');
const {
  attendanceSchema,
  reportSchema
} = require('../validations/attendance.validation');

// All routes protected
router.use(auth);

// Teacher/admin routes
router.post('/', role('teacher', 'admin'), validate(attendanceSchema), recordAttendance);
router.patch('/:id', role('teacher', 'admin'), validate(attendanceSchema), updateAttendance);
router.get('/class/:classId', role('teacher', 'admin'), getClassAttendance);
router.get('/report', role('teacher', 'admin'), validate(reportSchema), generateReport);

// Student/parent routes
router.get('/student/:studentId', role('teacher', 'admin', 'parent'), getStudentAttendance);
router.get('/', role('student'), getAttendance);

module.exports = router;