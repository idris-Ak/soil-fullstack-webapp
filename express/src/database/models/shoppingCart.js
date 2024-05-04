module.exports = (sequelize, DataTypes) => {
  const ShoppingCart = sequelize.define("ShoppingCart", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        models: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'shoppingcarts'
  });

  return ShoppingCart;
};
