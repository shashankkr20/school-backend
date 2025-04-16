const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createHomework,
  getHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  gradeHomework,
  getHomeworkSubmissions
} = require('../controllers/homework.controller');
const {
  homeworkSchema,
  submissionSchema,
  gradingSchema
} = require('../validations/homework.validation');

// All routes protected
router.use(auth);

// Teacher routes
router.post('/', role('teacher'), upload.array('attachments', 5), validate(homeworkSchema), createHomework);
router.patch('/:id', role('teacher'), upload.array('attachments', 5), validate(homeworkSchema), updateHomework);
router.delete('/:id', role('teacher'), deleteHomework);

// Submission routes
router.post('/:id/submit', role('student'), upload.array('attachments', 5), validate(submissionSchema), submitHomework);
router.patch('/submissions/:id/grade', role('teacher'), validate(gradingSchema), gradeHomework);

// View routes
router.get('/', role('teacher', 'student'), getHomework);
router.get('/submissions', role('teacher'), getHomeworkSubmissions);

module.exports = router;