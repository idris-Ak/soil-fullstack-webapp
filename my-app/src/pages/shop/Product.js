import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form } from 'react-bootstrap';
import "./product.css";

export const Product = ({ item, addToCart, isLoggedIn }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showProductDetails, setProductDetails] = useState(false);
    const [quantity, setQuantity] = useState(1); // State for quantity

    const navigate = useNavigate();

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
            navigate('/Login');        }
    };

    return (
        <Card className="product-card" style={{ width: '18rem', height:'30rem' }}>
            <Card.Img onClick={handleShow} style={{ cursor: 'pointer'}} variant="top" src={item.img} alt={item.name} className="product-image" />
            {item.special && <div className="photos"  onClick={handleShow} style={{ cursor: 'pointer'}}>Special</div>}
            <Card.Body className="product-body">
                <Card.Title className="product-title"  onClick={handleShow} style={{ cursor: 'pointer'}}>{item.name}</Card.Title>
                <Card.Text className="product-price">${item.price.toFixed(2)}</Card.Text>
                <Button onClick={handleAddToCart} className="add-to-cart-btn">
                    Add To Cart
                </Button>
                {showNotification && <div className="add-to-cart-notification">Successfully Added To Cart!</div>}
            </Card.Body>

            <Modal show={showProductDetails} onHide={handleClose} centered>
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
                </Modal.Body>
                <Modal.Footer>
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
