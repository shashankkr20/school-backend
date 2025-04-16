const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { Timetable, User, Profile } = require('../models');

/**
 * Create or update timetable entries in bulk
 */
const updateTimetable = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { class: className, section, entries } = req.body;

    // Validate input
    if (!className || !section || !entries || !Array.isArray(entries)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid timetable data');
    }

    // Delete existing entries for this class/section
    await Timetable.destroy({
      where: {
        class: className,
        section
      },
      transaction
    });

    // Create new entries
    const timetableEntries = entries.map(entry => ({
      class: className,
      section,
      day_of_week: entry.dayOfWeek,
      period: entry.period,
      subject: entry.subject,
      teacher_id: entry.teacherId,
      room_number: entry.roomNumber,
      start_time: entry.startTime,
      end_time: entry.endTime
    }));

    const createdEntries = await Timetable.bulkCreate(timetableEntries, { transaction });

    await transaction.commit();

    res.status(httpStatus.CREATED).json({
      success: true,
      data: createdEntries
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get timetable for a specific class/section
 */
const getTimetable = async (req, res, next) => {
  try {
    const { class: className, section } = req.params;

    const timetable = await Timetable.findAll({
      where: {
        class: className,
        section
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'email'],
        include: [{
          model: Profile,
          as: 'profile',
          attributes: ['first_name', 'last_name']
        }]
      }],
      order: [
        ['day_of_week', 'ASC'],
        ['period', 'ASC']
      ]
    });

    // Format as day-wise structure
    const formattedTimetable = {};
    timetable.forEach(entry => {
      if (!formattedTimetable[entry.day_of_week]) {
        formattedTimetable[entry.day_of_week] = [];
      }
      formattedTimetable[entry.day_of_week].push(entry);
    });

    res.json({
      success: true,
      data: formattedTimetable
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher's timetable
 */
const getTeacherTimetable = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const timetable = await Timetable.findAll({
      where: {
        teacher_id: teacherId
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'email'],
        include: [{
          model: Profile,
          as: 'profile',
          attributes: ['first_name', 'last_name']
        }]
      }],
      order: [
        ['day_of_week', 'ASC'],
        ['period', 'ASC']
      ]
    });

    // Format as day-wise structure
    const formattedTimetable = {};
    timetable.forEach(entry => {
      if (!formattedTimetable[entry.day_of_week]) {
        formattedTimetable[entry.day_of_week] = [];
      }
      formattedTimetable[entry.day_of_week].push(entry);
    });

    res.json({
      success: true,
      data: formattedTimetable
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current class based on time
 */
const getCurrentClass = async (req, res, next) => {
  try {
    const { class: className, section } = req.params;
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentTime = now.toTimeString().substring(0, 8); // HH:MM:SS

    const currentClass = await Timetable.findOne({
      where: {
        class: className,
        section,
        day_of_week: currentDay,
        start_time: { [Op.lte]: currentTime },
        end_time: { [Op.gte]: currentTime }
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'email'],
        include: [{
          model: Profile,
          as: 'profile',
          attributes: ['first_name', 'last_name']
        }]
      }]
    });

    if (!currentClass) {
      return res.json({
        success: true,
        data: null,
        message: 'No class scheduled at this time'
      });
    }

    res.json({
      success: true,
      data: currentClass
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateTimetable,
  getTimetable,
  getTeacherTimetable,
  getCurrentClass
};