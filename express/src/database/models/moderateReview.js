module.exports = (sequelize, DataTypes) => {
    const ModerateReview = sequelize.define('ModerateReview', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      adminID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'id'
        }
      },
      reviewID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reviews',
        key: 'id'
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
      tableName: 'moderatereviews'
    });
    return ModerateReview;
  };