module.exports = (sequelize, DataTypes) => {
  const AdminActions = sequelize.define('AdminActions', {
    actionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    adminID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'adminID'
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
    tableName: 'adminActions'
  });
  return AdminActions;
};