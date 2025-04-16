const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class HomeworkSubmission extends BaseModel {
  static modelName = 'HomeworkSubmission';
  static tableName = 'homework_submissions';
  static schema = {
    homework_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    submission_text: {
      type: DataTypes.TEXT
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    grade: {
      type: DataTypes.STRING(10)
    },
    feedback: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'late'),
      defaultValue: 'submitted'
    }
  };

  static associations(models) {
    HomeworkSubmission.belongsTo(models.Homework, {
      foreignKey: 'homework_id',
      as: 'homework'
    });
    HomeworkSubmission.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student'
    });
    HomeworkSubmission.hasMany(models.HomeworkAttachment, {
      foreignKey: 'submission_id',
      as: 'attachments'
    });
  }
}

module.exports = HomeworkSubmission;