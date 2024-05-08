module.exports = (sequelize, DataTypes) => {
const Follow = sequelize.define('Follow', {
    followerID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    followingID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    }
}, {
    tableName: 'userFollows',
    timestamps: false
});

    return Follow;
};