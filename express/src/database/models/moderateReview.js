module.exports = (sequelize, DataTypes) => {
    const ModerateReview = sequelize.define('moderateReview', {
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
      ActionTaken: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ActionTimeDate: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'moderateReview'
    });
    return ModerateReview;
  };