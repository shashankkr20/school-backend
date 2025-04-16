const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { Circular, User, CircularRecipient } = require('../models');
const { sendNotification } = require('../services/notification.service');

const createCircular = async (req, res, next) => {
  try {
    const { title, content, isImportant, startDate, endDate, recipientIds } = req.body;
    
    const circular = await Circular.create({
      title,
      content,
      author_id: req.user.id,
      is_important: isImportant || false,
      start_date: startDate,
      end_date: endDate
    });

    // Add recipients if specified
    if (recipientIds && recipientIds.length > 0) {
      const recipients = recipientIds.map(userId => ({
        circular_id: circular.id,
        user_id: userId
      }));
      await CircularRecipient.bulkCreate(recipients);
      
      // Send notifications
      await sendNotification({
        title: 'New Circular',
        body: title,
        userIds: recipientIds
      });
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: circular
    });
  } catch (error) {
    next(error);
  }
};

const getCirculars = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, importantOnly, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (importantOnly === 'true') where.is_important = true;
    
    if (startDate && endDate) {
      where[Op.and] = [
        { start_date: { [Op.lte]: endDate } },
        { end_date: { [Op.gte]: startDate } }
      ];
    }

    const circulars = await Circular.findAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: circulars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Circular.count({ where })
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCircularById = async (req, res, next) => {
  try {
    const circular = await Circular.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'email', 'role']
        },
        {
          model: CircularRecipient,
          as: 'recipients',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }]
        }
      ]
    });

    if (!circular) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Circular not found');
    }

    // Mark as read if recipient
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      await CircularRecipient.update(
        { read_at: new Date() },
        {
          where: {
            circular_id: circular.id,
            user_id: req.user.id
          }
        }
      );
    }

    res.json({
      success: true,
      data: circular
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCircular,
  getCirculars,
  getCircularById
};