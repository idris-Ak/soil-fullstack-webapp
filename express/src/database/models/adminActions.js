module.exports = (sequelize, DataTypes) => {
  const AdminActions = sequelize.define('adminActions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    AdminID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admin',
        key: 'id'
      }
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ActionType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ActionTimeDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'adminActions'
  });
  return AdminActions;
};