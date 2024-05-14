import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form, Alert, Pagination, DropdownButton, Dropdown } from 'react-bootstrap';
import "./product.css";
import axios from 'axios'


export const Product = ({ item, addToCart, isLoggedIn, currentUser }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showProductDetails, setProductDetails] = useState(false);
    const [quantity, setQuantity] = useState(1); //State for quantity
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const[newReview, setNewReview] = useState('');
    const[rating, setRating] = useState(1); 
    const[edit, setEdit] = useState(false); //State for editing reviews
    const[editReviewID, setEditReviewID] = useState(null); //State for the reviewID that is being edited
    const [errorMessage, setErrorMessage] = useState('');
    const[showErrorMessage, setShowErrorMessage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sortOrder, setSortOrder] = useState('Latest'); //State for managing sort order
    const navigate = useNavigate();
    const reviewsPerPage = 3;

    const loadReviews = useCallback(async (sort = sortOrder) => {
        //Send error message if productID is not present
        if (!item.productID) {
            console.error('Product ID is missing');
            return;
        }
        try {
            //Get the reviews from the database while fetching the currentUserID for the followers functionality 
            const response = await axios.get(`http://localhost:4000/api/review/${item.productID}`, {
                params: { currentUserID: currentUser.id, page: currentPage, limit: reviewsPerPage, sort: sort }
            });
            //Set the reviews
                if (response.data) {
                    console.log("Reviews loaded:", response.data);
                    //Set the reviews from the API data
                    setReviews(response.data.reviews);
                    //Set the pages based on the number of reviews
                    setTotalPages(response.data.totalPages);
                    //Calculate the average rating based on the existing reviews of a product
                    const totalStars = response.data.reviews.reduce((acc, review) => acc + review.numberOfStars, 0);
                    setAverageRating(totalStars / response.data.reviews.length || 0);
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
    }, [item.productID, currentUser, currentPage, sortOrder]);

    useEffect(() => {
        loadReviews();
    }, [showProductDetails, loadReviews, currentPage, sortOrder]);

    const handleReviewSubmit = async (event) => {
        event.preventDefault(); 
        //If the user is not logged in, navigate them to the login page
        if (!isLoggedIn || !currentUser) {
            navigate('/Login');
            return;
        }
        const currentDate = new Date().toISOString(); // Create a date string in ISO format
        
        //Set review attributes
        const reviewData = {
            productID: item.productID,
            userID: currentUser.id, // Send null if anonymous is true
            reviewText: newReview,
            numberOfStars: rating,
            dateCreated: currentDate, // Include the current date when submitting the review
            userName: currentUser.name // Optional, based on your backend design
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
                //Set reviews based on if the attributes of the review and the following state were updated
                let updatedReviews = [...reviews];
                if (edit) {
                    updatedReviews = updatedReviews.map(r => r.reviewID === response.data.reviewID ? { ...r, ...response.data } : r);
                } else {
                    updatedReviews = [...updatedReviews, { ...response.data, isFollowing: false }];
                }
    
                //Determine if new page is needed
                const newTotalPages = Math.ceil(updatedReviews.length / reviewsPerPage);
                if (newTotalPages > totalPages) {
                     //Move to the new last page
                    setCurrentPage(newTotalPages); 
                }
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
    
    const handleEdit = (event, review) => {
        event.preventDefault();
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

    const handleSortChange = (sortKey) => {
        setSortOrder(sortKey);
        loadReviews(sortKey);
    };

    const renderSortOptions = () => (
        //Styling for the sorting options of the reviews
        <DropdownButton title={`Sort by: ${sortOrder}`} id="sort-dropdown" onSelect={handleSortChange} className="mb-3">
            <Dropdown.Item eventKey="Latest">Latest</Dropdown.Item>
            <Dropdown.Item eventKey="Highest">Highest Rating</Dropdown.Item>
            <Dropdown.Item eventKey="Lowest">Lowest Rating</Dropdown.Item>
        </DropdownButton>
    );
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        let items = [];
        //Set the current page based on the number of pages 
        if (totalPages > 1) {
            if (currentPage > 1) {
                items.push(<Pagination.First key="first" onClick={() => paginate(1)} disabled={currentPage === 1} />);
                items.push(<Pagination.Prev key="prev" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />);
            }

            //Change the format of the pagination based on the current page number 
            const startPage = currentPage > 2 ? currentPage - 2 : 1;
            const endPage = Math.min(startPage + 4, totalPages);
            for (let number = startPage; number <= endPage; number++) {
                items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>{number}</Pagination.Item>);
            }

            if (currentPage < totalPages) {
                items.push(<Pagination.Next key="next" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />);
                items.push(<Pagination.Last key="last" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />);
            }
        }

        return (
            <div style={{marginTop:'20px'}} className="d-flex justify-content-center align-items-center">
                <div style={{ margin: '0 20px', fontFamily: 'Open Sans, sans-serif' }}>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></div>
                <Pagination className="ml-3 mr-3">{items}</Pagination>
            </div>
        );
    };


    return (
        <Card className="product-card" style={{ width: '18rem', height:'30rem' }}>
            <Card.Img onClick={handleShow} style={{ cursor: 'pointer'}} variant="top" src={item.img} alt={item.name} className="product-image" />
            {item.isSpecial && <div className="photos"  onClick={handleShow} style={{ cursor: 'pointer'}}>Special</div>}
            <Card.Body className="product-body">
                <Card.Title className="product-title"  onClick={handleShow} style={{ cursor: 'pointer'}}>{item.name}</Card.Title>
                {reviews.length > 0 && (
                    <div className="average-rating">
                        <i className="fas fa-star" style={{ color: 'gold' }}></i> {averageRating.toFixed(1)}
                    </div>
                )}
                <Card.Text style={{marginTop: '20px'}} className="product-price">${item.price}</Card.Text>
                <Button onClick={handleAddToCart} className="add-to-cart-btn">
                    Add To Cart
                </Button>
                {showNotification && <div className="add-to-cart-notification">Successfully Added To Cart!</div>}
            </Card.Body>

            <Modal show={showProductDetails} onHide={handleClose} centered size='lg'>
            {showErrorMessage && errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Modal.Header closeButton>
                    <Modal.Title style={{fontFamily: 'Open Sans, sans-serif'}} className="text-center">{item.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div className="d-flex align-items-center">
                        <div className="mr-3">
                            <img src={item.img} alt={item.name} className='rounded' style={{ paddingRight: '10px', maxWidth: '150px' }} />
                        </div>
                        <div>
                            <p style={{fontFamily: 'Open Sans, sans-serif'}}>{item.description}</p>
                            <Form.Group controlId="quantity">
                                <Form.Label>Quantity:</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Button variant="outline-secondary" onClick={() => setQuantity(quantity - 1)} disabled={quantity === 1}>-</Button>
                                    <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mx-2" />
                                    <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
                                    <Button style={{ marginLeft: '200px', whiteSpace: 'nowrap' }} variant="primary" onClick={handleAddToCart}>Add To Cart</Button>
                                </div>
                            </Form.Group>
                        </div>
                    </div>
                {/* Section for reviews */}
                <hr />
                    <h3 style={{fontFamily: 'Open Sans, sans-serif', fontWeight: 'bold'}} >Reviews</h3>
                    {renderSortOptions()}
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.reviewID} className="review-item" style={{ fontFamily: 'Roboto, sans-serif', borderBottom: '1px solid #e0e0e0'}}>
                            <div style={{marginTop: '10px'}} className="rating">
                                {/* OpenAI (2024) ChatGPT [Large language model], accessed 13 May 2024. (*Link could not be generated successfully*) */}
                                {[...Array(review.numberOfStars)].map((_, i) => (
                                    <i key={i} className="fas fa-star checked" style={{ color: 'gold' }}></i>
                                ))}
                                {[...Array(5 - review.numberOfStars)].map((_, i) => (
                                    <i key={i} className="far fa-star" style={{ color: 'gold' }}></i>
                                ))}
                            </div>
                                <strong>{review.user ? review.user.name : 'Anonymous'}</strong>
                                <span style={{ float: 'right', fontSize: '0.8em', color: 'gray' }}>{new Date(review.dateCreated).toLocaleDateString()}</span>
                                <br />
                                <div style={{marginTop: '8px', marginBottom: '8px'}}>
                                <i>{review.reviewText}</i>
                            </div>
                            <br />
                            {currentUser && currentUser.id === review.userID && (
                                <div style={{marginBottom: '10px'}} className="d-flex justify-content-between">
                                    <Button style={{fontFamily: 'Lato, sans-serif'}} variant="info" size="sm" onClick={(event) => handleEdit(event, review)}>Edit</Button>
                                    <Button style={{fontFamily: 'Lato, sans-serif'}} variant="danger" size="sm" onClick={() => handleDeleteReview(review.reviewID)}>Delete</Button>
                                </div>
                            )}
                            {currentUser && currentUser.id !== review.userID && (
                                <Button style={{fontFamily: 'Open Sans, sans-serif'}} variant="primary"  size="sm"  className="ml-auto" onClick={() => toggleFollow(review)}>
                                    {review.isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                            )}
                        </div>
                        )) : (
                    <p style={{fontFamily: 'Roboto, sans-serif', fontWeight: 'bold', fontSize: '18px', alignContent: 'center'}}>No reviews yet. Be the first to write one!</p>
                    )}
                       {renderPagination()}
                    {isLoggedIn && (
                    <Form onSubmit={handleReviewSubmit} className="mt-3">
                        <Form.Group className="mb-2">
                            <Form.Label style={{fontFamily: 'Open Sans, sans-serif'}} >Write your review:</Form.Label>
                            <Form.Control as="textarea" rows={5} value={newReview} onChange={(e) => setNewReview(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label style={{fontFamily: 'Open Sans, sans-serif', marginBottom: '10px'}} >Rating:</Form.Label>
                            <div>
                                {/* Map the integers 1-5 to stars */}
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i key={star} className={`fa fa-star${rating >= star ? ' checked' : ''}`} onClick={() => setRating(star)} style={{ cursor: 'pointer', color: rating >= star ? 'gold' : 'grey' }}></i>
                                ))}
                            </div>
                        </Form.Group>
                        <Button style={{fontFamily: 'Lato, sans-serif', marginTop: '10px'}} type="submit" variant="primary">{edit ? 'Update Review' : 'Submit Review'}</Button>
                    </Form>
                      )}
                </Modal.Body>
                {/* <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddToCart}>
                        Add To Cart
                    </Button>
                </Modal.Footer> */}
            </Modal>
        </Card>
    );
};

export default Product;
