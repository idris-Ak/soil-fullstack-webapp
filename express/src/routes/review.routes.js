const { Router } = require('express');
const controller = require("../controllers/review.controller.js");
const router = Router();

// Select add all router methods (get, post, etc)
router.post('/', controller.postReview);
router.put('/:reviewID', controller.editReview);
router.delete('/:reviewID', controller.deleteReview);
router.post('/follow/:followingID', controller.followUsers);
router.delete('/follow/:followingID', controller.followUsers);
router.get('/:productID', controller.getReviews);

module.exports = router;
