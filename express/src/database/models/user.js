module.exports = (sequelize, DataTypes) =>
  sequelize.define("", {}, {
    // Don't add the timestamp attributes (updatedAt, createdAt).
    timestamps: false
  });
