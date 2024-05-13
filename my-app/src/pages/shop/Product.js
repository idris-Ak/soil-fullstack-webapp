import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form, Alert} from 'react-bootstrap';
import "./product.css";
import axios from 'axios'

export const Product = ({ item, addToCart, isLoggedIn, currentUser }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showProductDetails, setProductDetails] = useState(false);
    const [quantity, setQuantity] = useState(1); //State for quantity
    const [reviews, setReviews] = useState([]);
    const[newReview, setNewReview] = useState('');
    const[rating, setRating] = useState(1); 
    const[edit, setEdit] = useState(false); //State for editing reviews
    const[editReviewID, setEditReviewID] = useState(null); //State for the reviewID that is being edited
    const [errorMessage, setErrorMessage] = useState('');
    const[showErrorMessage, setShowErrorMessage] = useState(false);
    const navigate = useNavigate();

    const loadReviews = useCallback(async () => {
        //Send error message if productID is not present
        if (!item.productID) {
            console.error('Product ID is missing');
            return;
        }
        try {
            //Get the reviews from the database while fetching the currentUserID for the followers functionality 
            const response = await axios.get(`http://localhost:4000/api/review/${item.productID}`, {
                params: { currentUserID: currentUser.id }
            });
            //Set the reviews
                if (response.data) {
                console.log("Reviews loaded:", response.data);
                setReviews(response.data);
            }else {
                setShowErrorMessage(true);
                setTimeout(() => {
                    setErrorMessage('No reviews found');
                    setShowErrorMessage(false);
                }, 2500);
            }
        } catch (error) {
            //Send error messages if something doesn't work
            setShowErrorMessage(true);
            setTimeout(() => {
            setErrorMessage(`Failed to load reviews: ${error.response?.data?.message || 'Server error'}`);
            setShowErrorMessage(false);
            }, 2500);
        }
    }, [item.productID, currentUser]);

    useEffect(() => {
        if (showProductDetails) {
            loadReviews();
        }
    }, [showProductDetails, loadReviews]);

    const handleReviewSubmit = async() => {
        //If the user is not logged in, navigate them to the login page
        if (!isLoggedIn || !currentUser) {
            navigate('/Login');
            return;
        }
        
        //Set review attributes
        const reviewData = {
            productID: item.productID,
            userID: currentUser.id,
            reviewText: newReview,
            numberOfStars: rating
        };

        //Check if the review is between 1-100 words
        if(newReview.length > 0 && newReview.length <= 100) {
            //Fetch reviews based upon if the user is editing the review or not
            const fetchReviews = edit ? `http://localhost:4000/api/review/${editReviewID}` : 'http://localhost:4000/api/review';
            let response;
            //If the user is editing the review, use 'put'
            if (edit) {
                response = await axios.put(fetchReviews, reviewData);
            } else {
                //Otherwise, use 'post'
                response = await axios.post(fetchReviews, reviewData);
            }
            try{
                console.log("Review submitted:", response.data);
                //Set reviews based on  if the attributes  of the review and the following state were updated
                setReviews(prev => edit ? prev.map(r => r.reviewID === response.data.reviewID ? { ...r, ...response.data } : r) : [...prev, { ...response.data, user: currentUser, isFollowing: false }]);
                setNewReview('');
                setRating(1);
                setEdit(false);
                setEditReviewID(null);
            } catch(error){
                //Send error messages
                setShowErrorMessage(true);
                setTimeout(() => {
                setErrorMessage(`Failed to submit review: ${error.response?.data.message || error.message}`);
                setShowErrorMessage(false);
                }, 2500);
            }
        }
        else{
            //Alert the user if the review exceeds 100 words
            setShowErrorMessage(true);
            setTimeout(() => {
            setErrorMessage('Review must be between 1 and 100 words.');
            setShowErrorMessage(false);
            }, 2500);
            
        }
    };
    
    const handleEdit = (review) => {
        //Set the edit states to true if the user clicks on the 'edit' button
        setEdit(true);
        setEditReviewID(review.reviewID);
        setNewReview(review.reviewText);
        setRating(review.numberOfStars);
    };

    const handleDeleteReview = async(reviewID) => {
        try{
            //Delete the review from the database
            const response = await axios.delete(`http://localhost:4000/api/review/${reviewID}`);
            //If the response status is successful then filter out the deleted reviews from the current reviews
            if (response.status === 200) {
                setReviews(reviews.filter(review => review.reviewID !== reviewID));
            }
        } catch (error) {
            //Send error messages
            setShowErrorMessage(true);
            setTimeout(() => {
            setErrorMessage('Failed to delete review: ' + (error.response?.data?.message || error.message));;
            setShowErrorMessage(false);
            }, 2500);

        }
    };

    const toggleFollow = async (review) => {
        //Get the current followers of the logged in user from the database
        const method = review.isFollowing ? 'delete' : 'post';
        const endpoint = `http://localhost:4000/api/review/follow/${review.userID}`;
        try {
            await axios[method](endpoint, { followerID: currentUser.id });
            console.log("Follow toggled for user:", review.userID);
            //If the user follows another user, change the following status to true otherwise if they decide to unfollow someone, change the following status to false
            setReviews(prev => prev.map(r => r.reviewID === review.reviewID ? { ...r, isFollowing: !r.isFollowing } : r));
        } catch (error) {
            console.error('Error toggling follow status', error);
        }
    };

    const handleClose = () => setProductDetails(false);
    const handleShow = () => setProductDetails(true);
    
    const handleAddToCart = () => {
        if(isLoggedIn){
            addToCart(item, quantity); // Add the item to the cart with selected quantity
            setShowNotification(true); // Show the notification
            setTimeout(() => setShowNotification(false), 2000); // Hide after 2 seconds
            }
        else{
            alert('Please log in to add to cart.');
            navigate('/Login');        
        }
    };

    return (
        <Card className="product-card" style={{ width: '18rem', height:'30rem' }}>
            <Card.Img onClick={handleShow} style={{ cursor: 'pointer'}} variant="top" src={item.img} alt={item.name} className="product-image" />
            {item.isSpecial && <div className="photos"  onClick={handleShow} style={{ cursor: 'pointer'}}>Special</div>}
            <Card.Body className="product-body">
                <Card.Title className="product-title"  onClick={handleShow} style={{ cursor: 'pointer'}}>{item.name}</Card.Title>
                <Card.Text className="product-price">${item.price}</Card.Text>
                <Button onClick={handleAddToCart} className="add-to-cart-btn">
                    Add To Cart
                </Button>
                {showNotification && <div className="add-to-cart-notification">Successfully Added To Cart!</div>}
            </Card.Body>

            <Modal show={showProductDetails} onHide={handleClose} centered>
            {showErrorMessage && errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Modal.Header closeButton>
                    <Modal.Title className="text-center">{item.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div className="d-flex align-items-center">
                        <div className="mr-3">
                            <img src={item.img} alt={item.name} className='rounded' style={{ paddingRight: '10px', maxWidth: '150px' }} />
                        </div>
                        <div>
                            <p>{item.description}</p>
                            <Form.Group controlId="quantity">
                                <Form.Label>Quantity:</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Button variant="outline-secondary" onClick={() => setQuantity(quantity - 1)} disabled={quantity === 1}>-</Button>
                                    <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mx-2" />
                                    <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
                                </div>
                            </Form.Group>
                        </div>
                    </div>
                {/* Section for reviews */}
                <hr />
                    <h5>Reviews</h5>
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.reviewID} className="review-item">
                            <strong>{review.user ? review.user.name : 'Anonymous'}</strong>  <br />
                            <i>{review.reviewText}</i>
                            <div className="rating">
                                {/* OpenAI (2024) ChatGPT [Large language model], accessed 13 May 2024. (*Link could not be generated successfully*) */}
                                {[...Array(review.numberOfStars)].map((_, i) => (
                                    <i key={i} className="fas fa-star checked"></i>
                                ))}
                                {[...Array(5 - review.numberOfStars)].map((_, i) => (
                                    <i key={i} className="far fa-star"></i>
                                ))}
                            </div>
                            {currentUser && currentUser.id === review.userID && (
                                <div className="d-flex justify-content-between">
                                    <Button variant="info" size="sm" onClick={() => handleEdit(review)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.reviewID)}>Delete</Button>
                                </div>
                            )}
                            {currentUser && currentUser.id !== review.userID && (
                                <Button variant="link" onClick={() => toggleFollow(review)}>
                                    {review.isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                            )}
                        </div>
                        )) : (
                    <p>No reviews yet. Be the first to write one!</p>
                    )}
                    <Form onSubmit={handleReviewSubmit} className="mt-3">
                        <Form.Group className="mb-2">
                            <Form.Label>Write your review:</Form.Label>
                            <Form.Control as="textarea" rows={5} value={newReview} onChange={(e) => setNewReview(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Rating:</Form.Label>
                            <div>
                                {/* Map the integers 1-5 to stars */}
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i key={star} className={`fa fa-star${rating >= star ? ' checked' : ''}`} onClick={() => setRating(star)} style={{ cursor: 'pointer', color: rating >= star ? 'gold' : 'grey' }}></i>
                                ))}
                            </div>
                        </Form.Group>
                        <Button type="submit" variant="primary">{edit ? 'Update Review' : 'Submit Review'}</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddToCart}>
                        Add To Cart
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default Product;
