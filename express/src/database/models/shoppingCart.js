module.exports = (sequelize, DataTypes) => {
  const ShoppingCart = sequelize.define("ShoppingCart", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
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
