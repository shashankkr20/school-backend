const { DataTypes } = require('sequelize');
const { BaseModel } = require('./BaseModel');

class Circular extends BaseModel {
  static init(sequelize) {
    return super.init({
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_important: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
      },
    }, {
      sequelize,
      modelName: 'circular',
      tableName: 'circulars',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author',
    });
    this.hasMany(models.CircularRecipient, {
      foreignKey: 'circular_id',
      as: 'recipients',
    });
  }
}

module.exports = Circular;