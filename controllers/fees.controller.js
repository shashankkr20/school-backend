const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/apiError');
const { StudentFee, FeeStructure, Student } = require('../models');
const { processPayment } = require('../services/payment.service');

const getFeeStructures = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, frequency } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (frequency) where.frequency = frequency;

    const fees = await FeeStructure.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['applicable_from', 'DESC']]
    });

    res.json({
      success: true,
      data: fees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await FeeStructure.count({ where })
      }
    });
  } catch (error) {
    next(error);
  }
};

const getStudentFees = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, status, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { student_id: studentId };
    if (status) where.status = status;
    
    if (fromDate && toDate) {
      where.due_date = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const fees = await StudentFee.findAll({
      where,
      include: [
        {
          model: FeeStructure,
          as: 'fee_structure',
          attributes: ['name', 'description', 'frequency']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['admission_number', 'grade', 'section']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['due_date', 'ASC']]
    });

    res.json({
      success: true,
      data: fees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await StudentFee.count({ where })
      }
    });
  } catch (error) {
    next(error);
  }
};

const payFee = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const { amount, paymentMethod, transactionDetails } = req.body;

    const fee = await StudentFee.findByPk(feeId);
    if (!fee) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Fee record not found');
    }

    // Process payment
    const paymentResult = await processPayment({
      amount,
      paymentMethod,
      feeId,
      studentId: fee.student_id,
      ...transactionDetails
    });

    // Update fee record
    fee.paid_amount = parseFloat(fee.paid_amount) + parseFloat(amount);
    fee.payment_method = paymentMethod;
    fee.transaction_reference = paymentResult.transactionId;
    
    if (fee.paid_amount >= fee.amount) {
      fee.status = 'paid';
      fee.paid_at = new Date();
    } else {
      fee.status = 'partial';
    }

    await fee.save();

    res.json({
      success: true,
      data: {
        fee,
        payment: paymentResult
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeeStructures,
  getStudentFees,
  payFee
};