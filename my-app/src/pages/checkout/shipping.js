import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import "./shipping.css"; // Import the CSS file

function Shipping() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const [checkoutDetails, setCheckoutDetails] = useState({
        firstname: '',
        lastname: '',
        address: '',
        country: '',
        postcode: '',
        city: '',
        state: '',
    });

    // Function to handle changes in input fields
    const handleChange = (event) => {
        const { name, value } = event.target;
        setCheckoutDetails({ ...checkoutDetails, [name]: value });
    };

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
            // Retrieve delivery data from local storage
            const storedCheckoutDetails = JSON.parse(localStorage.getItem("checkoutDetails"));

            // Check if there's any delivery data in local storage
            if (storedCheckoutDetails) {
                setCheckoutDetails(storedCheckoutDetails);
            }
        }
    }, [isMounted]);

    // Update local storage whenever delivery data changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("checkoutDetails", JSON.stringify(checkoutDetails));
        }
    }, [checkoutDetails, isMounted]);

    // Function to validate form before proceeding to payment
    const validateForm = () => {
        // Check if any field is empty
        for (const key in checkoutDetails) {
            if (!checkoutDetails[key] && key !== 'card' ) {
                setTimeout(() => setErrorMessage("Please fill in all fields."), 2500);
                return;
            }
        }
        // Proceed to the next step
        navigate('/Payment');
    };

    return (
        <div>
            <div className="shipping-container">
                <h1>Shipping</h1>
                <p>Please enter your shipping details.</p>
                <div className="separator">
                    <hr className="line" />
                    <Link to='/cart' style={{ textDecoration: 'none', color: 'black' }}>
                        <p>Cart</p>
                    </Link>
                    <hr className="line" />
                    <Link to='/shipping' style={{ textDecoration: 'none', color: 'black' }}>
                        <p><b>Shipping</b></p>
                    </Link>
                    <hr className="line" />
                    <p>Payment</p>
                    <hr className="line" />
                    <p>Checkout</p>
                    <hr className="line" />
                </div>
                <div className="shipping-form">
                    <div className="shipping-fields shipping-fields--2">
                        <label className="shipping-field">
                            <span className="shipping-field__label">First name</span>
                            <input className="shipping-field__input" type="text" name="firstname" value={checkoutDetails.firstname} onChange={handleChange} />
                        </label>
                        <label className="shipping-field">
                            <span className="shipping-field__label">Last name</span>
                            <input className="shipping-field__input" type="text" name="lastname" value={checkoutDetails.lastname} onChange={handleChange} />
                        </label>
                    </div>
                    <label className="shipping-field">
                        <span className="shipping-field__label">Address</span>
                        <input className="shipping-field__input" type="text" name="address" value={checkoutDetails.address} onChange={handleChange} />
                    </label>
                    <label className="shipping-field">
                        <span className="shipping-field__label">Country</span>
                        <select className="shipping-field__input" name="country" value={checkoutDetails.country} onChange={handleChange}>
                            <option value=""></option>
                            <option value="Australia">Australia</option>
                        </select>
                    </label>
                    <div className="shipping-fields shipping-fields--3">
                        <label className="shipping-field">
                            <span className="shipping-field__label">Post Code</span>
                            <input className="shipping-field__input" type="text" name="postcode" value={checkoutDetails.postcode} onChange={handleChange} />
                        </label>
                        <label className="shipping-field">
                            <span className="shipping-field__label">City</span>
                            <input className="shipping-field__input" type="text" name="city" value={checkoutDetails.city} onChange={handleChange} />
                        </label>
                        <label className="shipping-field">
                            <span className="shipping-field__label">State</span>
                            <select className="shipping-field__input" name="state" value={checkoutDetails.state} onChange={handleChange}>
                                <option value="">Select State</option>
                                <option value="NSW">NSW</option>
                                <option value="QLD">QLD</option>
                                <option value="SA">SA</option>
                                <option value="TAS">TAS</option>
                                <option value="VIC">VIC</option>
                                <option value="WA">WA</option>
                                <option value="ACT">ACT</option>
                                <option value="NT">NT</option>
                            </select>
                        </label>
                    </div>
                    {errorMessage && <div className="error-message" ><p><b>{errorMessage}</b></p></div>}
                </div>
                <hr />
                <Button variant="primary" className="purchase--btn" onClick={validateForm}>Proceed To payment</Button>
            </div>
        </div>
    );
}

export default Shipping;
