const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { Homework, HomeworkSubmission, Student, User } = require('../models');
const { uploadToCloud } = require('../services/storage.service');

const createHomework = async (req, res, next) => {
  try {
    const { title, description, subject, class: className, dueDate } = req.body;
    
    const homework = await Homework.create({
      title,
      description,
      subject,
      class: className,
      teacher_id: req.user.id,
      due_date: dueDate
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloud(file).then(result => ({
          homework_id: homework.id,
          file_url: result.url,
          file_name: result.originalname,
          file_type: result.mimetype,
          file_size: result.size
        }))
      );

      const attachments = await Promise.all(uploadPromises);
      await HomeworkAttachment.bulkCreate(attachments);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: homework
    });
  } catch (error) {
    next(error);
  }
};

const getHomework = async (req, res, next) => {
  try {
    const { class: className, subject, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (className) where.class = className;
    if (subject) where.subject = subject;

    const homework = await Homework.findAll({
      where,
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'email'],
          include: [{
            model: Profile,
            as: 'profile',
            attributes: ['first_name', 'last_name']
          }]
        },
        {
          model: HomeworkAttachment,
          as: 'attachments',
          attributes: ['id', 'file_name', 'file_type']
        }
      ],
      order: [['due_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: homework,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Homework.count({ where })
      }
    });
  } catch (error) {
    next(error);
  }
};

const submitHomework = async (req, res, next) => {
  try {
    const { homeworkId } = req.params;
    const { submissionText } = req.body;

    const homework = await Homework.findByPk(homeworkId);
    if (!homework) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Homework not found');
    }

    // Check if student has already submitted
    const existingSubmission = await HomeworkSubmission.findOne({
      where: {
        homework_id: homeworkId,
        student_id: req.user.id
      }
    });

    if (existingSubmission) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Homework already submitted');
    }

    const submission = await HomeworkSubmission.create({
      homework_id: homeworkId,
      student_id: req.user.id,
      submission_text: submissionText,
      status: new Date() > new Date(homework.due_date) ? 'late' : 'submitted'
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloud(file).then(result => ({
          submission_id: submission.id,
          file_url: result.url,
          file_name: result.originalname,
          file_type: result.mimetype,
          file_size: result.size
        }))
      );

      const attachments = await Promise.all(uploadPromises);
      await HomeworkAttachment.bulkCreate(attachments);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHomework,
  getHomework,
  submitHomework
};