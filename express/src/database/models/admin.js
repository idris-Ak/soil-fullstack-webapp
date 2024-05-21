module.exports = (sequelize, DataTypes) => {
 const Admin = sequelize.define("Admin", {
    adminID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
 }, {
    tableName: 'Admins'
 });

    return Admin;
};