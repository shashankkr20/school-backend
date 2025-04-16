const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class PasswordResetToken extends BaseModel {
  static modelName = 'PasswordResetToken';
  static tableName = 'password_reset_tokens';
  static schema = {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  };

  static associations(models) {
    PasswordResetToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

module.exports = PasswordResetToken;