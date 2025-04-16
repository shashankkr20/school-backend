const { Sequelize } = require('sequelize');

class BaseModel extends Sequelize.Model {
  static init(sequelize, options = {}) {
    super.init(this.schema, {
      sequelize,
      modelName: this.modelName,
      tableName: this.tableName,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ...options
    });
  }

  static associate(models) {
    if (this.associations) {
      this.associations(models);
    }
  }
}

module.exports = BaseModel;