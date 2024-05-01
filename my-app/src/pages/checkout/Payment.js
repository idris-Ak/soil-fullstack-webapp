import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from 'react-bootstrap';
import "./Payment.css"; // Import the CSS file

function Payment() {
    const navigate = useNavigate();
    const [cardholder, setCardholder] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Function to validate the payment form
    const validateForm = () => {
        // Check if any field is empty
        if (!cardholder || !cardNumber || !expiryDate || !cvv) {
            setTimeout(() => setErrorMessage("Please fill in all fields."), 2500);
            return;
        }

        // Check if card number is valid (dummy validation for demonstration)
        if (!isValidCardNumber(cardNumber.replace(/\s/g, ""))) {
            setTimeout(() => setErrorMessage("Please enter a valid card number."), 2500);
            return;
        }

        // Check if expiry date is valid (dummy validation for demonstration)
        if (!isValidExpiryDate(expiryDate)) {
            setTimeout(() => setErrorMessage("Please enter a valid expiry date."), 2500);
            return;
        }

        // Check if CVV is valid (dummy validation for demonstration)
        if (!isValidCvv(cvv)) {
            setTimeout(() => setErrorMessage("Please enter a valid CVV.", 2500));
            return;
        }
        // save used card
        // Retrieve checkoutDetails from localStorage
        let checkoutDetails = JSON.parse(localStorage.getItem('checkoutDetails'));

        // Check if checkoutDetails exists in localStorage
        if (!checkoutDetails) {
            // If not, initialize it as an empty object
            checkoutDetails = {};
        }

        // Add the cardNumber to checkoutDetails
        checkoutDetails.card = cardNumber;

        // Save the updated checkoutDetails back to localStorage
        localStorage.setItem("checkoutDetails", JSON.stringify(checkoutDetails));

        // If all validations pass, proceed to confirmation page
        console.log("Payment is valid. Proceeding...");
        navigate('/Checkout'); // Redirect to confirmation page
    };
    

    //  validation functions (replace with actual validation logic)
    const isValidCardNumber = (number) => {
        //  validation: Check if the card number has 16 digits
        return /^\d{16}$/.test(number);
    };

    const isValidExpiryDate = (date) => {
        // Check if the date is in MM/YY format
        if (!/^\d{1,2}\/\d{2}$/.test(date)) {
            return false;
        }
    
        // Split the date string into month and year
        const [monthStr, yearStr] = date.split('/');
    
        // Parse month and year as integers
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
    
        // Get the current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the current year
        const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
    
        // Check if the input expiry year is in the future
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return false;
        }
    
        return true;
    };
            const isValidCvv = (cvv) => {
        //  validation: Check if the CVV has 3 digits
        return /^\d{3}$/.test(cvv);
    };

    // Function to format the credit card number with automatic gaps
    const formatCardNumber = (value) => {
        // Remove all non-numeric characters
        const numericValue = value.replace(/\D/g, "");
        // Insert a space every 4 characters
        const formattedValue = numericValue.replace(/(.{4})/g, "$1 ").trim();
        // Update the state with the formatted value
        setCardNumber(formattedValue);
    };

    return (
        <div>
            <div className="payment-container">
                <h1>Payment</h1>
                <div className="payment-modal">
                    <div className="separator">
                        <hr className="line" />
                        <Link to='/cart' style={{ textDecoration: 'none', color: 'black' }}>
                            <p>Cart</p>
                        </Link>
                        <hr className="line" />
                        <Link to='/shipping' style={{ textDecoration: 'none', color: 'black' }}>
                            <p>Shipping</p>
                        </Link>
                        <hr className="line" />
                        <p><b>Payment</b></p>
                        <hr className="line" />
                        <p>Checkout</p>
                        <hr className="line" />
                    </div>
                    <div style={{textAlign:"center"}} >
                        <p style={{textAlign:"center"}} ><b>Pay using credit card</b></p>
                    </div>
                    <div className="credit-card-info--form">
                        <div className="input_container">
                            <label htmlFor="cardholder" className="input_label">Card holder full name</label>
                            <input id="cardholder" className="input_field" type="text" name="input-name" title="Input title" placeholder="Enter your full name" value={cardholder} maxLength={50} onChange={(e) => setCardholder(e.target.value)} />
                        </div>
                        <div className="input_container">
                            <label htmlFor="cardnumber" className="input_label">Card Number</label>
                            <input id="cardnumber" className="input_field" type="text" name="input-name" title="Input title" placeholder="0000 0000 0000 0000" value={cardNumber} maxLength={19} onChange={(e) => formatCardNumber(e.target.value)} />
                        </div>
                        <div className="input_container">
                            <label className="input_label">Expiry Date / CVV</label>
                            <div className="split">
                                <input id="expirydate" className="input_field" type="text" name="expiry" title="Expiry Date" placeholder="01/23" value={expiryDate} maxLength={5} onChange={(e) => setExpiryDate(e.target.value)} />
                                <input id="cvv" className="input_field" type="text" name="cvv" title="CVV" placeholder="CVV" value={cvv} maxLength={3} onChange={(e) => setCvv(e.target.value)} />
                            </div>
                        </div>
                        {errorMessage && <div className="error-message" ><p><b>{errorMessage}</b></p></div>}
                        <div style={{paddingBottom: '20px', paddingTop: '10px'}}className="separator">
                            <hr className="line" />
                        </div>
                    </div>
                    <Button variant="primary" className="purchase--btn" onClick={validateForm}>Checkout</Button>
                </div>
            </div>
        </div>
    );
}

export default Payment;
