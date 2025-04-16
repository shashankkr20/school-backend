const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class CircularRecipient extends BaseModel {
  static modelName = 'CircularRecipient';
  static tableName = 'circular_recipients';
  static schema = {
    circular_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    read_at: {
      type: DataTypes.DATE
    }
  };

  static associations(models) {
    CircularRecipient.belongsTo(models.Circular, {
      foreignKey: 'circular_id',
      as: 'circular'
    });
    CircularRecipient.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'recipient'
    });
  }
}

module.exports = CircularRecipient;