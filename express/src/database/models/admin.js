module.exports = (sequelize, DataTypes) => {
 const Admin = sequelize.define("Admin", {
    adminID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
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
    tableName: 'Admins'
 });

    return Admin;
};