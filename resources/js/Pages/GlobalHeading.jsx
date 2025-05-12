// GlobalHeading.jsx
import React, { useContext } from 'react';
import NavLink from '@/Components/NavLink';
import { CartContext } from '../context/cartContext';  // Import CartContext
import { FaShoppingCart } from 'react-icons/fa';  // Example cart icon from react-icons

const GlobalHeading = () => {
    const { cart } = useContext(CartContext);  // Access the cart from context

    // Calculate total quantity in cart
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="bg-white py-4 shadow-sm mb-4">
            {/* <header className="bg-white py-4 shadow-sm mb-4 fixed top-0 left-0 right-0 z-10"> */}
            <div className="container mx-auto flex justify-between items-center px-4">
                <nav aria-labelledby="header-navigation">
                    <h2 className="sr-only" id="header-navigation">Header navigation</h2>
                    <ul className="flex space-x-6 text-gray-900">
                        <li>
                            <NavLink href={route('content-view.home')} active={route().current('content-view.home')}>
                                All Content
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('content-map-view')} active={route().current('content-map-view')}>
                                React Map
                            </NavLink>
                        </li>

                        <li>
                            <NavLink href={route('content-view.home')} active={route().current('courses.index')}>
                                Portfolio
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('courses.index')} active={route().current('courses.index')}>
                                Premium Content
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('courses.index')} active={route().current('courses.index')}>
                                Subscription
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href={route('courses.index')} active={route().current('courses.index')}>
                                Additional Content
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                
                {/* Cart Icon with Item Count */}
                <div className="relative">
                    <NavLink href={route('cart-view.index')} className="text-gray-900 hover:text-gray-600">
                        <FaShoppingCart size={24} />
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {cartItemCount}
                            </span>
                        )}
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

export default GlobalHeading;
