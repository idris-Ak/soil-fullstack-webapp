module.exports = (express, app) => {
  const controller = require("../controllers/cart.controller.js");
  const router = express.Router();

  // Select add all router methods (get, post, etc)

  // Add routes to server.
  app.use("/api/cart", router);
};
