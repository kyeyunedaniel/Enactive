// resources/js/Layouts/AuthenticatedLayout.jsx

import React, { useState, Fragment, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import {
    HomeIcon,
    EyeIcon,
    Squares2X2Icon,
    HeartIcon,
    LockClosedIcon,
    ShoppingBagIcon,
    PencilSquareIcon,
    CodeBracketIcon,
    BoltIcon,
    CreditCardIcon,
    Cog6ToothIcon,
    ArrowTopRightOnSquareIcon,
    ChevronDownIcon,
    ShareIcon,
    Bars3Icon,
    XMarkIcon,
    QuestionMarkCircleIcon,
    InformationCircleIcon,
    BellIcon,
    SparklesIcon,
    ChatBubbleLeftEllipsisIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    EyeIcon as EyeIconSolid,
    Squares2X2Icon as Squares2X2IconSolid,
    HeartIcon as HeartIconSolid,
    LockClosedIcon as LockClosedIconSolid,
    ShoppingBagIcon as ShoppingBagIconSolid,
    PencilSquareIcon as PencilSquareIconSolid,
    CodeBracketIcon as CodeBracketIconSolid,
    BoltIcon as BoltIconSolid,
    CreditCardIcon as CreditCardIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';
import Dropdown from '@/Components/Dropdown';

// Enhanced Fuel Icon with gradient
const FuelIcon = ({ className = '' }) => (
    <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="url(#fuelGradient)"/>
    </svg>
);

// Enhanced Sidebar Navigation Components
const SidebarNavLink = ({ href, active, icon, solidIcon, children, external = false, badge = null }) => {
    const baseClasses = "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out";
    const activeClasses = "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm";
    const linkClasses = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;

    const iconToShow = active && solidIcon ? solidIcon : icon;

    return (
        <Link href={href} className={linkClasses} target={external ? '_blank' : ''} rel={external ? 'noopener noreferrer' : ''}>
            <div className="flex items-center">
                {React.cloneElement(iconToShow, { 
                    className: `w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}` 
                })}
            </div>
            <span className="ml-3 flex-1">{children}</span>
            {badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {badge}
                </span>
            )}
            {external && <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-auto text-gray-400" />}
        </Link>
    );
};

const SidebarDropdown = ({ title, icon, solidIcon, active, children }) => {
    const [isOpen, setIsOpen] = useState(active);
    const baseClasses = "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out";
    const activeClasses = "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm";

    const iconToShow = active && solidIcon ? solidIcon : icon;

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
            >
                {React.cloneElement(iconToShow, { 
                    className: `w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}` 
                })}
                <span className="ml-3 flex-1">{title}</span>
                <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <Transition
                show={isOpen}
                enter="transition-all ease-in-out duration-300"
                enterFrom="max-h-0 opacity-0"
                enterTo="max-h-96 opacity-100"
                leave="transition-all ease-in-out duration-200"
                leaveFrom="max-h-96 opacity-100"
                leaveTo="max-h-0 opacity-0"
            >
                <div className="mt-2 pl-8 space-y-1 overflow-hidden">
                    {children}
                </div>
            </Transition>
        </div>
    );
};

const SidebarSectionTitle = ({ children }) => (
    <h3 className="px-3 mt-8 mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
        {children}
    </h3>
);

// Quick Actions Component
const QuickActions = () => (
    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl mx-4 mb-4">
        <h4 className="text-sm font-semibold text-emerald-800 mb-2">Quick Actions</h4>
        <div className="space-y-1">
            <button className="w-full flex items-center px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Create Post
            </button>
            <button className="w-full flex items-center px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share Page
            </button>
        </div>
    </div>
);

// Main Sidebar Content Component
const SidebarContent = ({ user }) => (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
            <Link href={route('dashboard')} className="flex items-center space-x-3 group">
                <div className="p-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-green-500/25">
                    <FuelIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <span className="font-bold text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                        CreatorFuel
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">Creator Dashboard</p>
                </div>
            </Link>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <img
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=e2e8f0&color=475569`}
                        alt={user.name}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                </div>
                <SparklesIcon className="w-4 h-4 text-yellow-500" />
            </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('dashboard')} 
                icon={<HomeIcon className="w-5 h-5" />}
                solidIcon={<HomeIconSolid className="w-5 h-5" />}
            >
                Dashboard
            </SidebarNavLink>
            <SidebarNavLink 
                href={`/${user.username}`} 
                external 
                icon={<EyeIcon className="w-5 h-5" />}
                solidIcon={<EyeIconSolid className="w-5 h-5" />}
            >
                View Public Page
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('quiz.show', { quiz_id: 1 })} 
                active={route().current('explore')} 
                icon={<Squares2X2Icon className="w-5 h-5" />}
                solidIcon={<Squares2X2IconSolid className="w-5 h-5" />}
            >
                Explore Creators
            </SidebarNavLink>

            <SidebarSectionTitle>Monetization</SidebarSectionTitle>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('supporters.index')} 
                icon={<HeartIcon className="w-5 h-5" />}
                solidIcon={<HeartIconSolid className="w-5 h-5" />}
                badge="3"
            >
                Supporters
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('memberships.index')} 
                icon={<LockClosedIcon className="w-5 h-5" />}
                solidIcon={<LockClosedIconSolid className="w-5 h-5" />}
            >
                Memberships
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('shop.index')} 
                icon={<ShoppingBagIcon className="w-5 h-5" />}
                solidIcon={<ShoppingBagIconSolid className="w-5 h-5" />}
            >
                Shop
            </SidebarNavLink>
            <SidebarDropdown
                title="Content"
                icon={<PencilSquareIcon className="w-5 h-5" />}
                solidIcon={<PencilSquareIconSolid className="w-5 h-5" />}
                active={route().current('posts.*') || route().current('gallery.*')}
            >
                <SidebarNavLink href={route('dashboard')} active={route().current('posts.*')}>
                    Posts
                </SidebarNavLink>
                <SidebarNavLink href={route('dashboard')} active={route().current('gallery.*')}>
                    Gallery
                </SidebarNavLink>
            </SidebarDropdown>

            <SidebarSectionTitle>Settings</SidebarSectionTitle>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('buttons.index')} 
                icon={<CodeBracketIcon className="w-5 h-5" />}
                solidIcon={<CodeBracketIconSolid className="w-5 h-5" />}
            >
                Buttons & Graphics
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('integrations.index')} 
                icon={<BoltIcon className="w-5 h-5" />}
                solidIcon={<BoltIconSolid className="w-5 h-5" />}
            >
                Integrations
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('payouts.index')} 
                icon={<CreditCardIcon className="w-5 h-5" />}
                solidIcon={<CreditCardIconSolid className="w-5 h-5" />}
            >
                Payouts
            </SidebarNavLink>
            <SidebarNavLink 
                href={route('dashboard')} 
                active={route().current('profile.edit')} 
                icon={<Cog6ToothIcon className="w-5 h-5" />}
                solidIcon={<Cog6ToothIconSolid className="w-5 h-5" />}
            >
                Profile Settings
            </SidebarNavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>© 2024 CreatorFuel</span>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Online</span>
                </div>
            </div>
        </div>
    </div>
);

export default function AuthenticatedLayout({ user, header, children, showPayoutsBanner = false }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState(3);
    const pageTitle = header?.props?.children || 'Dashboard';

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Head title={pageTitle} />
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Mobile Sidebar */}
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <div className="relative z-50 lg:hidden">
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <div className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                            <button type="button" className="-m-2.5 p-2.5 rounded-full bg-white/10 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
                                                <span className="sr-only">Close sidebar</span>
                                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow-xl">
                                        <SidebarContent user={user} />
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-80 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white shadow-lg">
                        <SidebarContent user={user} />
                    </div>
                </aside>

                <div className="lg:pl-80">
                    {/* Enhanced Top bar */}
                    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between gap-x-6">
                                <div className="flex items-center gap-x-4">
                                    <button 
                                        type="button" 
                                        className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        <span className="sr-only">Open sidebar</span>
                                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                    
                                    {/* Search bar */}
                                    <div className="hidden sm:flex relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-x-4">
                                    {/* Notifications */}
                                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                                        {notifications > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {notifications}
                                            </span>
                                        )}
                                    </button>

                                    {/* Share button */}
                                    <button className="hidden sm:flex items-center gap-x-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-200">
                                        <ShareIcon className="-ml-0.5 h-4 w-4" />
                                        Share Page
                                    </button>

                                    {/* User dropdown */}
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                                                <img
                                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=e2e8f0&color=475569`}
                                                    alt={user.name}
                                                />
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="56">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                                                Profile Settings
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="py-8">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {/* Enhanced Payouts Setup Banner */}
                            {showPayoutsBanner && (
                                <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-6 border border-emerald-200 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="p-2 bg-emerald-100 rounded-full">
                                                <InformationCircleIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 md:flex md:justify-between md:items-center">
                                            <div>
                                                <h3 className="text-sm font-semibold text-emerald-900">Complete Your Setup</h3>
                                                <p className="text-sm text-emerald-700 mt-1">Link your payout method to start earning. It only takes a few minutes.</p>
                                            </div>
                                            <div className="mt-4 md:mt-0 md:ml-6">
                                                <Link 
                                                    href={route('payouts.index')} 
                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-200"
                                                >
                                                    Complete Setup
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Main Page Content */}
                            {header && (
                                <div className="mb-8">
                                    {header}
                                </div>
                            )}

                            {children}
                        </div>
                    </main>
                </div>
                
                {/* Enhanced Floating Help Button */}
                <div className="fixed bottom-6 right-6 z-40">
                    <button className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-110 transition-all duration-200">
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Get Help</span>
                    </button>
                </div>
            </div>
        </>
    );
}