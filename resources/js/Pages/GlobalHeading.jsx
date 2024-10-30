// GlobalHeading.jsx
import React from 'react';
import NavLink from '@/Components/NavLink';

const GlobalHeading = () => {
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
            </div>
        </header>
    );
};

export default GlobalHeading;
