module.exports = (express, app) => {
  const controller = require("../controllers/shoppingCart.controller.js");
  const router = express.Router();

  router.post("/", controller.InitialiseCart);
  router.get("/", controller.GetCartItems);

  app.use("/api/shoppingCart", router);
};
