const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class FeeStructure extends BaseModel {
  static modelName = 'FeeStructure';
  static tableName = 'fee_structures';
  static schema = {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    frequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annual', 'one-time')
    },
    applicable_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    applicable_to: {
      type: DataTypes.DATEONLY
    }
  };

  static associations(models) {
    FeeStructure.hasMany(models.StudentFee, {
      foreignKey: 'fee_structure_id',
      as: 'studentFees'
    });
  }
}

module.exports = FeeStructure;