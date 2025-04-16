const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class Attendance extends BaseModel {
  static modelName = 'Attendance';
  static tableName = 'attendance';
  static schema = {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'half-day'),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT
    },
    recorded_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  };

  static associations(models) {
    Attendance.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student'
    });
    Attendance.belongsTo(models.User, {
      foreignKey: 'recorded_by',
      as: 'recordedBy'
    });
  }
}

module.exports = Attendance;