const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class Exam extends BaseModel {
  static modelName = 'Exam';
  static tableName = 'exams';
  static schema = {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    subject: {
      type: DataTypes.STRING(100)
    },
    class: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME
    },
    end_time: {
      type: DataTypes.TIME
    },
    total_marks: {
      type: DataTypes.INTEGER
    },
    passing_marks: {
      type: DataTypes.INTEGER
    }
  };

  static associations(models) {
    // Add associations if needed
  }
}

module.exports = Exam;