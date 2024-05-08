module.exports = (sequelize, DataTypes) => {
const Review = sequelize.define('Review', {
  reviewID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        models: 'Product',
        key: 'productID'
      }
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        models: 'User',
        key: 'id'
      }
    },
    numberOfStars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
     reviewText: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'Reviews'
  });
  return Review; 
}