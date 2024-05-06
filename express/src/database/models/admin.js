module.exports = (sequelize, DataTypes) => {
 const Admin = sequelize.define("Admin", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    adminUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    adminPassword: {
        type: DataTypes.STRING,
        allowNull: false
    }
 }, {
    tableName: 'admins'
 });

    return Admin;
};