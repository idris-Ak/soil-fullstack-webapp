import React, { useState, useEffect } from "react";
import { getShopItems } from '../../repository/shopItems'; // Import shop items and functions
import { Product } from './Product';
import "./shop.css";

function Shop({ addToCart, isLoggedIn}) {

    // State variables to hold shop items and special shop items
    const [shopItems, setShopItems] = useState([]);

    // Load shop items and special items when the component mounts
    // Load shop items when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            const items = await getShopItems();
            setShopItems(items);
        };
        fetchData();
    }, []);
    return (
        <div>
            <div className="custom-wrapper">
                {/* <!-- page-header  --> */}
                <div className="page-header">
                    <img className="header-img" alt="shop-header" src='./shop_header_background.jpg' />
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                <div className="page-caption">
                                <h1 className="page-title">Organic Product Shop</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* page-header */}
                {/* news */}
                <div className="card-section" >
                    <div className="container">
                        <div className="card-block rounded mb30" >
                            <div className="row">
                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    {/* section-title */}
                                    <div className="section-title mb-0">
                                        <h2>Explore our selection of high-quality organic products.</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="section-products">
                <div className="container">
                    <div className="row">
                        {shopItems.map((item) => (
                            <div key={item.productID} className="col-md-6 col-lg-4 col-xl-3">
                                <Product item={item} addToCart={addToCart} isLoggedIn={isLoggedIn}/>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Shop;
