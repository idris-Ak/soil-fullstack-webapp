import React, {useState, useEffect} from "react";
import {  getSpecialItems } from '../repository/shopItems'; // Import shop items and functions
import { Product } from './shop/Product';

import './specials.css';

function Specials({ addToCart, isLoggedIn}) {

  // State variables to hold shop items and special shop items
  const [specialItems, setSpecialItems] = useState([]);
  // const [showNotification, setShowNotification] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const specials = await getSpecialItems();
        setSpecialItems(specials);
      } catch (error) {
        console.log("Error fetching special items:", error);
      }
    };
  
    fetchData();  }, []);

  return (
    <div className="container-fluid">
      {/* Carousel for showcasing specials */}
      <div className="container-fluid " >
        <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel" >
          <div className="carousel-inner">
            <div className="carousel-item active">
              {/*Photo by <a href="https://unsplash.com/@dirtjoy?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Zoe Schaeffer</a>
               on <a href="https://unsplash.com/photos/man-in-green-dress-shirt-and-gray-pants-standing-on-green-plants-during-daytime-siD6uufCyt8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>*/}
              <img src="farming_class_2.jpg" alt="Special 1" className="d-block w-100 rounded" style={{maxHeight:'800px', maxWidth: '1900px'}}/>
              <div className="carousel-caption d-none d-md-block">
                <h1 style={{color:'white'}}>Farming Classes</h1>
                <h6>50% off - Learn how to grow your own vegetables!</h6>
              </div>
            </div>
            <div className="carousel-item">
              {/*Photo by <a href="https://unsplash.com/@claybanks?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Clay Banks</a> on 
              <a href="https://unsplash.com/photos/white-and-green-flowers-on-brown-wooden-table-mIghSJJfWOc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>*/}
              <img src="nutrition_Counseling_2.jpg" alt="Special 2" className="d-block w-100 rounded" style={{maxHeight:'800px', maxWidth: '1900px'}}/>
              <div className="carousel-caption d-none d-md-block">
                <h1 style={{color:'white'}}>Nutrition Counseling</h1>
                <h6>Sign up today and receive your first week <b>FREE!</b></h6>
              </div>
            </div>
            <div className="carousel-item">
              {/*Photo by <a href="https://unsplash.com/@claybanks?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Clay Banks</a> on 
              <a href="https://unsplash.com/photos/white-and-green-flowers-on-brown-wooden-table-mIghSJJfWOc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>*/}
              <img src="packed_vegg_2.jpg" alt="Special 3" className="d-block w-100 rounded" style={{maxHeight: '800px', maxWidth: '1900px'}}/>
              <div className="carousel-caption d-none d-md-block">
                <h1 style={{color:'white'}}>Package Vegetables</h1>
                <h6>Up to <b>60% OFF!</b> - Come and get yours while stocks last</h6>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mt-5">
        <h2 className="ribbon" style={{ textAlign: 'center', textAlignLast: 'center'}}>Featured Products</h2>
        <hr/>
        <div className="row mt-3">
          {specialItems.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4 col-xl-3">
              <Product item={item} addToCart={addToCart} isLoggedIn={isLoggedIn}/>
            </div>
          ))}
          <div className="container mt-5">
            <h2 className="text-center">More Offers Coming Soon!</h2>
            <p className="lead text-center">Stay tuned for exciting new deals and offers.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Specials;
