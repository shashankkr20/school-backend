const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { Attendance, Student } = require('../models');

const markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status, reason } = req.body;

    // Check if attendance already marked for this date
    const existing = await Attendance.findOne({
      where: {
        student_id: studentId,
        date
      }
    });

    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Attendance already marked for this date');
    }

    const attendance = await Attendance.create({
      student_id: studentId,
      date,
      status,
      reason,
      recorded_by: req.user.id
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { studentId, fromDate, toDate, page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    if (!studentId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Student ID is required');
    }

    const where = { student_id: studentId };
    if (fromDate && toDate) {
      where.date = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['admission_number', 'grade', 'section']
      }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate stats
    const totalDays = await Attendance.count({ where });
    const presentDays = await Attendance.count({ 
      where: { 
        ...where,
        status: 'present'
      }
    });
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: attendance,
      stats: {
        totalDays,
        presentDays,
        percentage
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalDays
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { status, reason } = req.body;

    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Attendance record not found');
    }

    // Only allow updates by original recorder or admin
    if (attendance.recorded_by !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this record');
    }

    attendance.status = status;
    attendance.reason = reason;
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  updateAttendance
};