const { Router } = require('express');
const controller = require("../controllers/product.controller.js");
const router = Router();

// Select add all router methods (get, post, etc)
router.post('/', controller.addProduct);
router.get('/', controller.getAllProducts);
router.get('/specials', controller.getSpecialProducts);
router.get('/:id', controller.getProduct);

module.exports = router;