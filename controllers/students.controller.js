const httpStatus = require('http-status');
const { ApiError } = require('../utils/apiError');
const { Student, User, Profile } = require('../models');

const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, grade, section } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (grade) where.grade = grade;
    if (section) where.section = section;

    const students = await Student.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        include: ['profile'],
        attributes: { exclude: ['password_hash'] }
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['grade', 'ASC'], ['section', 'ASC'], ['roll_number', 'ASC']]
    });

    const total = await Student.count({ where });

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        include: ['profile'],
        attributes: { exclude: ['password_hash'] }
      }]
    });

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { email, password, ...studentData } = req.body;
    
    // Create user first
    const user = await User.create({
      email,
      password,
      role: 'student'
    });

    // Create student profile
    const student = await Student.create({
      ...studentData,
      user_id: user.id
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        ...student.toJSON(),
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
    }

    await student.update(req.body);
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent
};