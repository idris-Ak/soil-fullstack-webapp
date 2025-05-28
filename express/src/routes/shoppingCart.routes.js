const { Router } = require('express');
const controller = require("../controllers/shoppingCart.controller.js");
const router = Router();

// Select add all router methods (get, post, etc)
router.post("/", controller.InitialiseCart);
router.get("/", controller.GetCartItems);

module.exports = router;
