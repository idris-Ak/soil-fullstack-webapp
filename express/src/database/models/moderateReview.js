module.exports = (sequelize, DataTypes) => {
    const ModerateReview = sequelize.define('ModerateReview', {
      modID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      adminID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          models: 'Admin',
          key: 'adminID'
        }
      },
      reviewID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        models: 'Review',
        key: 'reviewID'
      }
    },
      ModerationActionTaken: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ModerationActionDateAndTime: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'moderateReviews'
    });
    return ModerateReview;
  };