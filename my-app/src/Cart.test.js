import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from './pages/shop/Cart';
import { BrowserRouter as Router } from 'react-router-dom';

describe('Cart Component', () => {
    // Mock functions for addToCart, removeFromCart, and setCart
    const mockAddToCart = jest.fn();
    const mockRemoveFromCart = jest.fn();

    // Sample cart items
    const cartItems = [
        {
            productID: 1,
            name: 'Product 1',
            description: 'Description 1',
            img: 'img1.jpg',
            price: 10,
            quantity: 1
        },
        {
            productID: 2,
            name: 'Product 2',
            description: 'Description 2',
            img: 'img2.jpg',
            price: 20,
            quantity: 2
        }
    ];

    // Render Cart component before each test
    beforeEach(() => {
        render(
            <Router>
                <Cart cart={cartItems} addToCart={mockAddToCart} removeFromCart={mockRemoveFromCart} />
            </Router>
        );
    });

    // // Test to ensure cart items are rendered correctly
    // it('renders cart items correctly', () => {
    //     // Assert that each cart item is rendered with correct details
    //     expect(screen.getByText('Product 1')).toBeInTheDocument();
    //     expect(screen.getByText('Description 1')).toBeInTheDocument();
    //     expect(screen.getByText('$10.00')).toBeInTheDocument();

    //     expect(screen.getByText('Product 2')).toBeInTheDocument();
    //     expect(screen.getByText('Description 2')).toBeInTheDocument();
    //     expect(screen.getByText('$40.00')).toBeInTheDocument();
    // });

    // // Test to check if addToCart is called when + button is clicked
    // it('calls addToCart when + button is clicked', () => {
    //     // Click the + button for the first cart item
    //     const addButton = screen.getAllByText('+')[0];
    //     fireEvent.click(addButton);
    //     // Assert that addToCart is called with the correct item and quantity
    //     expect(mockAddToCart).toHaveBeenCalledWith(cartItems[0], 1);
    // });

    // // Test to check if removeFromCart is called when - button is clicked
    // it('calls removeFromCart when - button is clicked', () => {
    //     // Click the - button for the first cart item
    //     const removeButton = screen.getAllByText('-')[0];
    //     fireEvent.click(removeButton);
    //     // Assert that removeFromCart is called with the correct item and quantity
    //     expect(mockRemoveFromCart).toHaveBeenCalledWith(cartItems[0], 1);
    // });

    // Test to ensure item is removed from cart when quantity becomes 0 after removal
    it('removes item from cart when quantity is 0 after remove', () => {
        // Click the - button for the first cart item to remove it
        const removeButton = screen.getAllByText('-')[0];
        fireEvent.click(removeButton);
        // Assert that removeFromCart is called with the correct item and quantity
        expect(mockRemoveFromCart).toHaveBeenCalledWith(cartItems[0], 1);

        // Re-render Cart component with updated cartItems (without the removed item)
        render(
            <Router>
                <Cart cart={cartItems.slice(1)} addToCart={mockAddToCart} removeFromCart={mockRemoveFromCart} />
            </Router>
        );

        // Assert that the removed item is no longer present in the cart
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    });


    // // Test to handle empty cart correctly
    // it('handles empty cart correctly', () => {
    //     // Render Cart component with an empty cart
    //     render(
    //         <Router>
    //             <Cart cart={[]} addToCart={mockAddToCart} removeFromCart={mockRemoveFromCart} />
    //         </Router>
    //     );
    //     // Assert that appropriate message is displayed for empty cart
    //     expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
    //     expect(screen.queryByText('ITEMS')).not.toBeInTheDocument();
    //     expect(screen.queryByText('Total Price')).not.toBeInTheDocument();
    // });

    // Test to handle multiple additions and removals correctly
    it('handles multiple additions and removals correctly', () => {
        // Add items to cart and then remove them
        const addButton1 = screen.getAllByText('+')[0];
        fireEvent.click(addButton1);
        expect(mockAddToCart).toHaveBeenCalledWith(cartItems[0], 1);

        const addButton2 = screen.getAllByText('+')[1];
        fireEvent.click(addButton2);
        expect(mockAddToCart).toHaveBeenCalledWith(cartItems[1], 1);

        // Remove items from cart
        const removeButton1 = screen.getAllByText('-')[0];
        fireEvent.click(removeButton1);
        expect(mockRemoveFromCart).toHaveBeenCalledWith(cartItems[0], 1);

        const removeButton2 = screen.getAllByText('-')[1];
        fireEvent.click(removeButton2);
        expect(mockRemoveFromCart).toHaveBeenCalledWith(cartItems[1], 1);
    });

    // Test to update cart items correctly on multiple interactions
    it('updates cart items correctly on multiple interactions', () => {
        // Initial assertions
        expect(screen.getByText('ITEMS 3')).toBeInTheDocument();
        expect(screen.getByText('$50.00')).toBeInTheDocument();

        // Add an item to cart
        const addButton = screen.getAllByText('+')[0];
        fireEvent.click(addButton);
        expect(mockAddToCart).toHaveBeenCalledWith(cartItems[0], 1);

        // Remove an item from cart
        const removeButton = screen.getAllByText('-')[1];
        fireEvent.click(removeButton);
        expect(mockRemoveFromCart).toHaveBeenCalledWith(cartItems[1], 1);

    });
});
