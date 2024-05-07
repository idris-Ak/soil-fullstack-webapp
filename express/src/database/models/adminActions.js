module.exports = (sequelize, DataTypes) => {
  const AdminActions = sequelize.define('AdminActions', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    adminID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ActionDateAndTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'adminactions'
  });
  return AdminActions;
};