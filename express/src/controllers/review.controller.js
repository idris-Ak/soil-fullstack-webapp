const db = require('../database');

exports.postReview = async(req, res) => {
    try{
        const{productID, userID, reviewText, numberOfStars} = req.body;
        //Validation check to ensure all attributes are not null
        if (!productID || !userID || !reviewText || !numberOfStars) {
            return res.status(400).send({ message: "Missing required fields" });
        }
        //Create a new review
        const review = await db.review.create({productID, userID, reviewText, numberOfStars});
        res.send(review);
    } catch(error){
        //Return any possible errors
        console.error("Error posting review:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.toString() });
    }
};

exports.editReview = async(req, res) => {
    const { reviewID } = req.params;
    const { reviewText, numberOfStars } = req.body;

    //Validation check to handle null input fields
    if (!reviewText || reviewText.trim() === '' || numberOfStars == null) {
        return res.status(400).send({ message: "Review text and number of stars must be provided." });
    }

    try{
        //Find the review by the reviewID
        const review = await  db.review.findByPk(reviewID);
        //Send a message if review is not there
        if (!review) {
            return res.status(404).send({ message: "Review not found." });
        }
        //Set the new review text and number of stars and save it
        review.reviewText = reviewText;
        review.numberOfStars = numberOfStars;
        await review.save();
        res.send(review);
    } catch(error){
        //Return any possible errors
        console.error("Error editing review:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.toString() });
    }
};

exports.deleteReview = async(req, res) => {
    const reviewID = req.params.reviewID; 

    //If reviewID is not there, send a message
    if (!reviewID) {
        return res.status(400).send({ message: "Review ID must be provided." });
    }

    try{
        //Find the review by the reviewID
        const review = await db.review.findByPk(reviewID);
        //Send a message if review is not there
        if (!review) {
            return res.status(404).send({ message: "Review not found." });
        }

        //Delete the review
        await review.destroy();
        res.send({message: "Review Successfully Deleted!"});
    } catch(error){
        //Return any possible errors
        console.error('Failed to delete review', error);
        res.status(500).send({ message: "Error deleting review", error: error.toString() });
    }
};


exports.followUsers = async(req, res) => {
    const { followerID } = req.body;
    const { followingID } = req.params;

    try {
        //Find any exisiting followers from the database by id
        const existingFollow = await db.follow.findOne({
            where: { followerID, followingID }
        });

        if (!existingFollow) {
            //If the follow between users doesn't exist, create the follow using the id's
            await db.follow.create({ followerID, followingID });
            //Send a message for a successful follow
            res.send({ message: 'Follow successful', isFollowing: true });
        } else {
            //Otherwise, delete the follower using the id's
            await db.follow.destroy({
                where: { followerID, followingID }
            });
            //Send a message for a successful unfollow
            res.send({ message: 'Unfollow successful', isFollowing: false });
        }
    } catch (error) {
        //Return any possible errors
        console.error('Error toggling follow status', error);
        res.status(500).send({ message: "Error with the follow/unfollow action", error: error.toString() });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const productID = req.params.productID;
        const currentUserID = req.query.currentUserID; 

        //Get all the existing reviews
        const reviews = await db.review.findAll({
            where: { productID },
            include: [
                {   
                    //get the users from the database and include the followers
                    model: db.user,
                    attributes: ['name', 'id'],
                    as: 'user',
                    include: [{
                        model: db.user,
                        as: 'Followers',
                        where: { id: currentUserID },
                         //This makes sure to fetch all reviews, not just the ones the user follows
                        required: false 
                    }]
                }]
        });
        
        //Map the reviews and follows
        const reviewsWithFollows = reviews.map(review => ({
            ...review.get({ plain: true }),
            isFollowing: review.user.Followers.length > 0
        }));

        res.json(reviewsWithFollows);

    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).send({ message: "Internal Server Error", error: error.toString() });
    }
  };
