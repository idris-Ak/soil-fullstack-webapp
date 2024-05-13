module.exports = (express, app) => {
  const controller = require("../controllers/review.controller.js");
  const router = express.Router();

    router.post('/', controller.postReview);
    router.put('/:reviewID', controller.editReview);
    router.delete('/:reviewID', controller.deleteReview);
    router.post('/follow/:followingID', controller.followUsers);
    router.get('/:productID', controller.getReviews); 

    // Add routes to server
    app.use("/api/review", router);

};
