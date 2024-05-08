module.exports = (sequelize, DataTypes) => {
const Product = sequelize.define('Product', {
  productID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description:{
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM('Dairy & Eggs', 'Fruits', 'Vegetables', 'Bakery', 'Meat & Seafood', 'Grains & Pasta', 'Nuts & Seeds'),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    isSpecial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false 
    },
    img: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'Products'
  });
  return Product;
}
