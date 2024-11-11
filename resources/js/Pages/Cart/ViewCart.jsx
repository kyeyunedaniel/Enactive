import React, { useContext } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { CartContext } from "@/Context/CartContext";

function ViewCart({ auth }) {
    const { cart, removeFromCart, updateCartItemQuantity } = useContext(CartContext);

    // Function to calculate total price
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.quantity * item.price), 0);
    };

    return (
        <AuthenticatedLayout user={auth}>
            <Head title="View Cart" />
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>
                
                {cart.length === 0 ? (
                    <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                    <>
                        <ul className="divide-y divide-gray-200 mb-6">
                            {cart.map((item) => (
                                <li key={item.product_id} className="flex items-center justify-between py-4">
                                    <div>
                                        <h2 className="text-xl font-medium">{item.name}</h2>
                                        <p className="text-gray-500">{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {/* Quantity Update */}
                                        <input
                                            type="number"
                                            min="1"
                                            max="1"
                                            value={item.quantity}
                                            onChange={(e) => updateCartItemQuantity(item.product_id, parseInt(e.target.value))}
                                            className="w-16 border rounded text-center"
                                        />
                                        <p className="text-lg font-medium">{(item.price * item.quantity).toFixed(2)}</p>
                                        {/* Remove Item Button */}
                                        <button
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="text-right">
                            <p className="text-2xl font-semibold">Total: $ {calculateTotal().toFixed(2)}</p>
                            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default ViewCart;
