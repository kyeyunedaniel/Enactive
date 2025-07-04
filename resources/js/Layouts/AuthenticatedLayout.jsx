// resources/js/Layouts/AuthenticatedLayout.jsx

import React, { useState, Fragment } from 'react';
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
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import Dropdown from '@/Components/Dropdown';
import Footer from './Footer';

// --- Re-used Icon ---
const FuelIcon = ({ className = '' }) => (
    <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="currentColor"/>
    </svg>
);

// --- Sidebar Navigation Components ---
const SidebarNavLink = ({ href, active, icon, children, external = false }) => {
    const baseClasses = "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150";
    const activeClasses = "bg-green-100 text-green-700";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    const linkClasses = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;

    return (
        <Link href={href} className={linkClasses} target={external ? '_blank' : ''} rel={external ? 'noopener noreferrer' : ''}>
            {icon}
            <span className="ml-3">{children}</span>
            {external && <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-auto text-gray-400" />}
        </Link>
    );
};

const SidebarDropdown = ({ title, icon, active, children }) => {
    const [isOpen, setIsOpen] = useState(active);
    const baseClasses = "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150";
    const activeClasses = "bg-green-100 text-green-700";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
            >
                {icon}
                <span className="ml-3">{title}</span>
                <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                <div className="mt-2 pl-6 space-y-1 overflow-hidden">
                    {children}
                </div>
            </Transition>
        </div>
    );
};

const SidebarSectionTitle = ({ children }) => (
    <h3 className="px-3 mt-6 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {children}
    </h3>
);

// --- Main Sidebar Content Component (to avoid duplication) ---
const SidebarContent = ({ user }) => (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
            <Link href={route('dashboard')} className="flex items-center space-x-2 text-green-600">
                <FuelIcon className="w-8 h-8" />
                <span className="font-bold text-2xl">CreatorFuel</span>
            </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <SidebarNavLink href={route('dashboard.home')} active={route().current('dashboard.home')} icon={<HomeIcon className="w-5 h-5" />}>
                Home
            </SidebarNavLink>
            <SidebarNavLink href={`/${user.username}`} external icon={<EyeIcon className="w-5 h-5" />}>
                View page
            </SidebarNavLink>
            <SidebarNavLink href={route('dashboard.explore')} active={route().current('dashboard.explore')} icon={<Squares2X2Icon className="w-5 h-5" />}>
                Explore creators
            </SidebarNavLink>

            <SidebarSectionTitle>Monetize</SidebarSectionTitle>
            <SidebarNavLink href={route('dashboard.support')} active={route().current('dashboard.support')} icon={<HeartIcon className="w-5 h-5" />}>
                Supporters
            </SidebarNavLink>
            {/* <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')} icon={<LockClosedIcon className="w-5 h-5" />}>
                Memberships
            </SidebarNavLink> */}

            {/* <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')} icon={<ShoppingBagIcon className="w-5 h-5" />}>
                Shop
            </SidebarNavLink> */}
            {/* <SidebarDropdown
                title="Publish"
                icon={<PencilSquareIcon className="w-5 h-5" />}
                active={route().current('posts.*') || route().current('gallery.*')}
            >
                <SidebarNavLink href={route('dashboard')} active={route().current('posts.*')}>Posts</SidebarNavLink>
                <SidebarNavLink href={route('dashboard')} active={route().current('gallery.*')}>Gallery</SidebarNavLink>
            </SidebarDropdown> */}

            <SidebarSectionTitle>Settings</SidebarSectionTitle>
            <SidebarNavLink href={route('dashboard.buttons&grahics')} active={route().current('dashboard.buttons&grahics')} icon={<CodeBracketIcon className="w-5 h-5" />}>
                Buttons & Graphics
            </SidebarNavLink>
            {/* <SidebarNavLink href={route('dashboard')} active={route().current('dashboard')} icon={<BoltIcon className="w-5 h-5" />}>
                Integrations
            </SidebarNavLink> */}
            <SidebarNavLink href={route('dashboard.payout')} active={route().current('dashboard.payout')} icon={<CreditCardIcon className="w-5 h-5" />}>
                Payouts
            </SidebarNavLink>
            <SidebarNavLink href={route('dashboard.settings')} active={route().current('dashboard.settings')} icon={<Cog6ToothIcon className="w-5 h-5" />}>
                Settings
            </SidebarNavLink>
        </nav>
    </div>
);


export default function AuthenticatedLayout({ user, header, children, showPayoutsBanner = false }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pageTitle = header?.props?.children || 'Dashboard'; // A reasonable default

    return (
        <>
            <Head title={pageTitle} />
            <div className="min-h-screen bg-gray-100 font-sans">
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
                            <div className="fixed inset-0 bg-gray-900/80" />
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
                                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                                <span className="sr-only">Close sidebar</span>
                                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white ring-1 ring-white/10">
                                        <SidebarContent user={user} />
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
                        <SidebarContent user={user} />
                    </div>
                </aside>

                <div className="lg:pl-72">
                    {/* Top bar for mobile and main content header */}
                    <header className="sticky top-0 z-30 bg-white shadow-sm lg:shadow-none lg:bg-transparent">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between gap-x-6 lg:justify-end">
                                <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
                                    <span className="sr-only">Open sidebar</span>
                                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                
                                <div className="flex items-center gap-x-4">
                                    <Link href={route('onboarding.user')} >
                                    <button type="button" className="hidden sm:flex items-center gap-x-2 rounded-full bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700">
                                        <ShareIcon className="-ml-0.5 h-5 w-5" />
                                        Share page
                                    </button>
                                    </Link>
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                             <button className="flex items-center p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                                <img
                                                    className="h-9 w-9 rounded-full object-cover bg-gray-200"
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=e2e8f0&color=475569`}
                                                    alt={user.name}
                                                />
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="48">
                                            <div className="px-4 py-3 border-b">
                                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="py-6">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {/* Payouts Setup Banner */}
                            {showPayoutsBanner && (
                                <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <InformationCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3 flex-1 md:flex md:justify-between">
                                            <p className="text-sm text-green-800">Please link your payout method, it only takes a few minutes.</p>
                                            <p className="mt-3 text-sm md:ml-6 md:mt-0">
                                                <Link href={route('dashboard')} className="whitespace-nowrap font-medium text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full">
                                                    Complete setup
                                                </Link>
                                            </p>
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
                            <Footer/>

                        </div>
                    </main>
                </div>
                
                 {/* Floating Help Button */}
                <button className="fixed bottom-6 right-6 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                </button>
            </div>
        </>
    );
}