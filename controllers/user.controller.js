const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { User, Profile } = require('../models');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { '$profile.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$profile.last_name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      include: [{
        model: Profile,
        as: 'profile',
        attributes: ['first_name', 'last_name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password_hash'] }
    });

    const total = await User.count({ where });

    res.json({
      success: true,
      data: users,
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

const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: ['profile'],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this user');
    }

    const { email, ...updateData } = req.body;
    
    if (email && email !== user.email) {
      if (await User.isEmailTaken(email, user.id)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
      }
      user.email = email;
    }

    await user.update(updateData);
    
    if (req.body.profile) {
      await user.profile.update(req.body.profile);
    }

    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (req.user.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete users');
    }

    await user.destroy();
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser
};