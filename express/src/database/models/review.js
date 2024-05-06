module.exports = (sequelize, DataTypes) =>
  sequelize.define("review", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product',
        key: 'id'
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    numStar: {
      type: DataTypes.ENUM('1', '2', '3', '4', '5'), // Define ENUM with allowed values 1-5
      allowNull: false
    },
    description:{
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'review'
  });