const db = require('../database');

exports.postReview = async(req, res) => {
    try{
        const{productID, userID, reviewText, numberOfStars, dateCreated} = req.body;
        //Validation check to ensure attributes are not null for the reviews unit test
        if (!productID || !userID || !reviewText || !numberOfStars) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        //Validation check for review text length for the reviews unit test
        if (reviewText.length > 100) {
            return res.status(400).send({ message: 'Review text cannot exceed 100 characters' });
        }
        //Create a new review
        const review = await db.review.create({
            productID,
            userID,
            reviewText,
            numberOfStars,
            dateCreated
        });
          //Fetch user details to include in the response
          const user = await db.user.findByPk(userID);
          if (!user) {
              return res.status(404).send({ message: "User not found." });
          }
        //Send the attributes          
        res.send({
            reviewID: review.reviewID,
            productID: review.productID,
            reviewText: review.reviewText,
            numberOfStars: review.numberOfStars,
            dateCreated: review.dateCreated,
            user: {
                id: user.id,
                name: user.name 
            },
            isFollowing: false 
        });        
    } catch(error){
        //Return any possible errors
        console.error("Error posting review:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.toString() });
    }
};

exports.editReview = async(req, res) => {
    const { reviewID } = req.params;
    const { reviewText, numberOfStars } = req.body;

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
        //Fetch user details to include in the response
        const user = await db.user.findByPk(review.userID);
        if (!user) {
              return res.status(404).send({ message: "User not found." });
        }
        res.send({
            reviewID: review.reviewID,
            reviewText: review.reviewText,
            numberOfStars: review.numberOfStars,
            user: {
                id: user.id,
                name: user.name  //Ensure name is sent back
            }
        });
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
        const currentUserID = req.query.currentUserID || null; 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3; //Default limit to 3 reviews per page
        const sort = req.query.sort || 'Latest'; //Get sort parameter, default is 'Latest'
        const offset = (page - 1) * limit;

        //Define sorting order based on the sorting parameter
        let order;
           switch (sort) {
               case 'Highest':
                   order = [['numberOfStars', 'DESC']];
                   break;
               case 'Lowest':
                   order = [['numberOfStars', 'ASC']];
                   break;
               case 'Latest':
               default:
                   order = [['dateCreated', 'DESC']];
                   break;
           }
    
        //Get the total count of reviews for pagination headers
        const totalReviews = await db.review.count({
            where: { productID }
        });
        
        //Get the active reviews for sorting and average rating calculation
        const activeReviews = await db.review.findAll({
            where: { productID, status: 'active' },
            attributes: ['numberOfStars']
        });

        //Calculate the average rating based on the active reviews
        const totalStars = activeReviews.reduce((acc, review) => acc + review.numberOfStars, 0);
        const averageRating = activeReviews.length > 0 ? totalStars / activeReviews.length : 0

        //Get all the existing reviews
        const reviews = await db.review.findAll({
            where: { productID },
            limit: limit,
            offset: offset,
            include: [
                {   
                    //Get the users from the database and include the followers
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
                }],
                order: order
            });
        
        //Map the reviews and follows
        const reviewsWithFollows = reviews.map(review => ({
            ...review.get({ plain: true }),
            isFollowing: review.user.Followers.length > 0
        }));

        res.json({
            reviews: reviewsWithFollows,
            page: page,
            totalPages: Math.ceil(totalReviews / limit),
            totalReviews: totalReviews,
            averageRating: averageRating
        });

    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).send({ message: "Internal Server Error", error: error.toString() });
    }
  };
