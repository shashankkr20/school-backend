const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class Timetable extends BaseModel {
  static modelName = 'Timetable';
  static tableName = 'timetable';
  static schema = {
    class: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    room_number: {
      type: DataTypes.STRING(20)
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    }
  };

  static associations(models) {
    Timetable.belongsTo(models.User, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });
  }
}

module.exports = Timetable;