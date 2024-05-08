module.exports = (sequelize, DataTypes) => {
  const ShoppingCart = sequelize.define("ShoppingCart", {
    cartID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },

    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        models: 'User',
        key: 'id'
      }
    }
  }, {
    tableName: 'shoppingCarts'
  });

  return ShoppingCart;
};
