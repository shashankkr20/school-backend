const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class HomeworkAttachment extends BaseModel {
  static modelName = 'HomeworkAttachment';
  static tableName = 'homework_attachments';
  static schema = {
    homework_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER
    }
  };

  static associations(models) {
    HomeworkAttachment.belongsTo(models.Homework, {
      foreignKey: 'homework_id',
      as: 'homework'
    });
    HomeworkAttachment.belongsTo(models.HomeworkSubmission, {
      foreignKey: 'submission_id',
      as: 'submission'
    });
  }
}

module.exports = HomeworkAttachment;