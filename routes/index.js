const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const studentRoutes = require('./student.routes');
const circularRoutes = require('./circulars.routes');
const feeRoutes = require('./fees.routes');
const homeworkRoutes = require('./homework.routes');
const attendanceRoutes = require('./attendance.routes');
const timetableRoutes = require('./timetable.routes');
const examRoutes = require('./exams.routes');

// API version prefix
const API_PREFIX = '/v1';

// Health check endpoint
router.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Mount all routes with version prefix
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/students`, studentRoutes);
router.use(`${API_PREFIX}/circulars`, circularRoutes);
router.use(`${API_PREFIX}/fees`, feeRoutes);
router.use(`${API_PREFIX}/homework`, homeworkRoutes);
router.use(`${API_PREFIX}/attendance`, attendanceRoutes);
router.use(`${API_PREFIX}/timetable`, timetableRoutes);
router.use(`${API_PREFIX}/exams`, examRoutes);

module.exports = router;