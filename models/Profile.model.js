const { DataTypes } = require('sequelize');
const BaseModel = require('./Base.model');

class Profile extends BaseModel {
  static modelName = 'Profile';
  static tableName = 'profiles';
  static schema = {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    address: {
      type: DataTypes.TEXT
    },
    date_of_birth: {
      type: DataTypes.DATEONLY
    },
    profile_picture_url: {
      type: DataTypes.STRING(255)
    }
  };

  static associations(models) {
    Profile.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

module.exports = Profile;