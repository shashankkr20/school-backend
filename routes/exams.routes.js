const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  getClassExams,
  getStudentExams,
  getExamResults
} = require('../controllers/exams.controller');
const {
  examSchema
} = require('../validations/exam.validation');

// All routes protected
router.use(auth);

// Admin/teacher routes
router.post('/', role('admin', 'teacher'), validate(examSchema), createExam);
router.patch('/:id', role('admin', 'teacher'), validate(examSchema), updateExam);
router.delete('/:id', role('admin', 'teacher'), deleteExam);

// View routes
router.get('/class/:classId', role('admin', 'teacher'), getClassExams);
router.get('/student', role('student'), getStudentExams);
router.get('/results/:examId', role('admin', 'teacher'), getExamResults);
router.get('/:id', getExam);
router.get('/', getExams);

module.exports = router;