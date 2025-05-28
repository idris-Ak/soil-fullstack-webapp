const { Router } = require('express');
const controller = require("../controllers/user.controller.js");
const router = Router();

// Select add all router methods (get, post, etc)
router.post('/SignUp', controller.SignUp);
router.post('/Login', controller.Login);
router.get('/:id', controller.getUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
