const { Router } = require('express');
const controller = require("../controllers/cartItem.controller.js");
const router = Router();

// Select add all router methods (get, post, etc)
router.post("/", controller.AddtoCart);
router.get("/:cartID", controller.GetItems);
router.put("/:itemId", controller.EditItemCount);
router.delete("/:itemId", controller.DeleteItemFromCart);

module.exports = router;
