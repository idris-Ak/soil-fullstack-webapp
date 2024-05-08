const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config.js");

const db = {
  Op: Sequelize.Op
};

// Create Sequelize.
db.sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
});

// Include models.
// exapamples below
// db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.admin = require("./models/admin.js")(db.sequelize, DataTypes);
db.shoppingCart = require("./models/shoppingCart.js")(db.sequelize, DataTypes);
db.cartItem = require("./models/cartItem.js")(db.sequelize, DataTypes);
db.review = require("./models/review.js")(db.sequelize, DataTypes);
db.follow = require("./models/follow.js")(db.sequelize, DataTypes);
db.product = require("./models/product.js")(db.sequelize, DataTypes);
db.adminActions = require("./models/adminActions.js")(db.sequelize, DataTypes);
db.moderateReview = require("./models/moderateReview.js")(db.sequelize, DataTypes);

// Relate the models
// example of post and user below.
// db.post.belongsTo(db.user, { foreignKey: { name: "username", allowNull: false } });
db.user.hasOne(db.shoppingCart, { foreignKey: 'userID' });
db.user.hasMany(db.review, { foreignKey: 'userID' });
db.user.belongsToMany(db.user, {
  through: db.follow,
  as: 'Followers',
  foreignKey: 'followingID',
  otherKey: 'followerID'
});
db.user.belongsToMany(db.user, {
  through: db.follow,
  as: 'Following',
  foreignKey: 'followerID',
  otherKey: 'followingID'
});

db.admin.hasMany(db.adminActions, { foreignKey: 'adminID' });
db.admin.hasMany(db.moderateReview, { foreignKey: 'adminID' });

db.shoppingCart.belongsTo(db.user, { foreignKey: 'userID' });
db.shoppingCart.hasMany(db.cartItem, { foreignKey: 'cartID' });

db.cartItem.belongsTo(db.shoppingCart, { foreignKey: 'cartID' });
db.cartItem.belongsTo(db.product, { foreignKey: 'productID' });

db.product.hasMany(db.cartItem, { foreignKey: 'productID' });
db.product.hasMany(db.review, { foreignKey: 'productID' });

db.review.belongsTo(db.user, { foreignKey: 'userID' });
db.review.belongsTo(db.product, { foreignKey: 'productID' });
db.review.hasMany(db.moderateReview, { foreignKey: 'reviewID' });

db.moderateReview.belongsTo(db.admin, { foreignKey: 'adminID' });
db.moderateReview.belongsTo(db.review, { foreignKey: 'reviewID' });

db.adminActions.belongsTo(db.admin, { foreignKey: 'adminID' });

// Learn more about associations here: https://sequelize.org/master/manual/assocs.html

// Include a sync option with seed data logic included.
db.sync = async () => {
  // Sync schema.
  await db.sequelize.sync();
  // await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  // // Can sync with force if the schema has become out of date - note that syncing with force is a destructive operation.
  // await db.sequelize.sync({ force: true });
  // await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  
  // await seedData();
};

// async function seedData() {
//   const count = await db.user.count();

//   // Only seed data if necessary.
//   if(count > 0)
//     return;

  // below is an example of adding a user

  // const argon2 = require("argon2");

  // let hash = await argon2.hash("abc123", { type: argon2.argon2id });
  // await db.user.create({ username: "mbolger", password_hash: hash, first_name: "Matthew", last_name : "Bolger" });

  // hash = await argon2.hash("def456", { type: argon2.argon2id });
  // await db.user.create({ username: "shekhar", password_hash: hash, first_name: "Shekhar", last_name : "Kalra" });
// }

module.exports = db;
