module.exports = (sequelize, DataTypes) => {
    const AdminActions = sequelize.define('AdminActions', {
        //Update this
      tableName: 'adminactions'
    });
  
    return AdminActions;
  };
  