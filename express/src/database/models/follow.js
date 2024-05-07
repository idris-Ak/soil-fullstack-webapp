module.exports = (sequelize, DataTypes) => {
const Follow = sequelize.define('Follow', {
    followerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    followingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'follows',
    timestamps: false
});

    return Follow;
};