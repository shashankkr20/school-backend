const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const BaseModel = require('./Base.model');

class User extends BaseModel {
  static modelName = 'User';
  static tableName = 'users';
  static schema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'parent', 'student'),
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  };

  static hooks = {
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  };

  static associations(models) {
    User.hasOne(models.Profile, {
      foreignKey: 'user_id',
      as: 'profile'
    });
    User.hasMany(models.PasswordResetToken, {
      foreignKey: 'user_id',
      as: 'passwordResetTokens'
    });
    User.hasMany(models.Circular, {
      foreignKey: 'author_id',
      as: 'authoredCirculars'
    });
    User.hasMany(models.CircularRecipient, {
      foreignKey: 'user_id',
      as: 'receivedCirculars'
    });
    User.hasMany(models.Student, {
      foreignKey: 'parent_id',
      as: 'children'
    });
    User.hasOne(models.Student, {
      foreignKey: 'user_id',
      as: 'studentProfile'
    });
  }

  async isPasswordMatch(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  static async isEmailTaken(email, excludeUserId = null) {
    const where = { email };
    if (excludeUserId) {
      where.id = { [this.sequelize.Op.ne]: excludeUserId };
    }
    const user = await User.findOne({ where });
    return !!user;
  }
}

module.exports = User;