const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class StudentFee extends BaseModel {
  static modelName = 'StudentFee';
  static tableName = 'student_fees';
  static schema = {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fee_structure_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    paid_at: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.STRING(50)
    },
    transaction_reference: {
      type: DataTypes.STRING(255)
    }
  };

  static associations(models) {
    StudentFee.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student'
    });
    StudentFee.belongsTo(models.FeeStructure, {
      foreignKey: 'fee_structure_id',
      as: 'feeStructure'
    });
  }
}

module.exports = StudentFee;