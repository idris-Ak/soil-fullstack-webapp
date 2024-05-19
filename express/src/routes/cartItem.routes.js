module.exports = (express, app) => {
  const controller = require("../controllers/cartItem.controller.js");
  const router = express.Router();

  // Select add all router methods (get, post, etc)
  router.post("/",controller.AddtoCart)
  router.get("/:cartID",controller.GetItems)
  router.put("/:itemId", controller.EditItemCount)
  router.delete("/:itemId", controller.DeleteItemFromCart);

  // Add routes to server.
  app.use("/api/cartItem", router);
};
