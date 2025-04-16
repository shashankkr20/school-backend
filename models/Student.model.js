const { DataTypes } = require('sequelize');
const { BaseModel } = require('./BaseModel');

class Student extends BaseModel {
  static init(sequelize) {
    return super.init({
      admission_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      grade: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      section: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      roll_number: {
        type: DataTypes.INTEGER,
      },
    }, {
      sequelize,
      modelName: 'student',
      tableName: 'students',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    this.belongsTo(models.User, {
      foreignKey: 'parent_id',
      as: 'parent',
    });
    this.hasMany(models.Attendance, {
      foreignKey: 'student_id',
      as: 'attendance_records',
    });
    this.hasMany(models.StudentFee, {
      foreignKey: 'student_id',
      as: 'fee_records',
    });
    this.hasMany(models.HomeworkSubmission, {
      foreignKey: 'student_id',
      as: 'homework_submissions',
    });
  }
}

module.exports = Student;