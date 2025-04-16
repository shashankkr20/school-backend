const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createTimetable,
  getTimetable,
  updateTimetable,
  deleteTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getStudentTimetable
} = require('../controllers/timetable.controller');
const {
  timetableSchema
} = require('../validations/timetable.validation');

// All routes protected
router.use(auth);

// Admin/teacher routes
router.post('/', role('admin', 'teacher'), validate(timetableSchema), createTimetable);
router.patch('/:id', role('admin', 'teacher'), validate(timetableSchema), updateTimetable);
router.delete('/:id', role('admin', 'teacher'), deleteTimetable);

// View routes
router.get('/class/:classId', role('admin', 'teacher'), getClassTimetable);
router.get('/teacher/:teacherId', role('admin', 'teacher'), getTeacherTimetable);
router.get('/student', role('student'), getStudentTimetable);
router.get('/:id', getTimetable);

module.exports = router;