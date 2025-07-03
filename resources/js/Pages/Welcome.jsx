import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SearchModal from './SearchModal';

// --- Icon Components ---
const FuelIcon = ({ className = '' }) => (
  <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// --- Creator Card Component ---
const CreatorCard = ({ avatarUrl, name, description, supporters, positionClasses }) => (
  <div className={`absolute bg-white p-4 rounded-xl shadow-lg w-60 transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${positionClasses}`}>
    <div className="flex items-center mb-2">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full mr-3 object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full mr-3 bg-gray-100 flex items-center justify-center font-bold text-gray-600">
          {name.charAt(0)}
        </div>
      )}
      <p className="font-semibold text-sm">{name}</p>
    </div>
    <p className="text-gray-600 text-sm mb-3">{description}</p>
    <p className="text-gray-500 text-xs flex items-center">
      <HeartIcon className="mr-1" /> {supporters.toLocaleString()} supporters
    </p>
  </div>
);

// --- Main Component ---
const Welcome = ({ auth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const user = auth?.user;

  const creatorData = [
    { 
      name: 'Cara', 
      avatarUrl: null, 
      description: 'Building a platform for digital artists', 
      supporters: 8780, 
      positionClasses: 'hidden lg:block top-20 left-10 xl:left-24' 
    },
    { 
      name: 'Kaleigh Cohen', 
      avatarUrl: 'https://images.unsplash.com/photo-1580894908361-967195033215?ixlib=rb-4.0.3&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200', 
      description: 'Creating fitness content on YouTube', 
      supporters: 4488, 
      positionClasses: 'hidden md:block bottom-24 left-5 xl:left-32' 
    },
    { 
      name: 'The Thrift', 
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200', 
      description: 'Sustainable fashion enthusiast', 
      supporters: 112, 
      positionClasses: 'hidden lg:block top-20 right-10 xl:right-24' 
    },
    { 
      name: 'Beach Talk', 
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200', 
      description: 'Independent podcast about coastal life', 
      supporters: 1805, 
      positionClasses: 'hidden md:block bottom-24 right-5 xl:right-32' 
    },
  ];

  return (
    <>
      <Head title="Fund your creative work - CreatorFuel" />
       <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <div className="bg-gray-50 min-h-screen font-sans text-gray-800 overflow-x-hidden relative">
        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
             onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Mobile Menu - Slides in from left */}
        <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <button onClick={() => setIsMenuOpen(false)} className="mr-4">
                  <CloseIcon />
                </button>
                <Link href="/" className="flex items-center space-x-2 text-green-600">
                  <FuelIcon className="text-green-600" />
                  <span className="font-bold text-xl">CreatorFuel</span>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon />
                </div>
                <input 
                  type="search" 
                  placeholder="Search creators..." 
                  className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsSearchOpen(true)
                  }}
                  readOnly
                />
              </div>
              
              <Link href="/faq" className="block px-4 py-3 rounded-lg hover:bg-gray-50 text-lg font-medium">FAQ</Link>
              <Link href="/wall-of-love" className="block px-4 py-3 rounded-lg hover:bg-gray-50 text-lg font-medium flex items-center">
                Wall of <HeartIcon className="ml-1" />
              </Link>
              
              <div className="px-4 py-3">
                <p className="text-lg font-medium mb-2">Resources</p>
                <div className="pl-2 space-y-2">
                  <Link href="/blog" className="block px-2 py-2 rounded-lg hover:bg-gray-50">Blog</Link>
                  <Link href="/guides" className="block px-2 py-2 rounded-lg hover:bg-gray-50">Guides</Link>
                  <Link href="/success" className="block px-2 py-2 rounded-lg hover:bg-gray-50">Success Stories</Link>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              {user ? (
                <Link 
                  href={route('dashboard')} 
                  className="block w-full text-center px-4 py-3 text-lg font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 mb-3"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href={route('login')} 
                    className="block w-full text-center px-4 py-3 text-lg font-semibold rounded-full border border-green-600 text-green-600 hover:bg-green-50 mb-3"
                  >
                    Log in
                  </Link>
                  <Link 
                    href={route('register')} 
                    className="block w-full text-center px-4 py-3 text-lg font-semibold rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-40 bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Left Side - Hamburger and Logo */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="md:hidden text-gray-600 hover:text-green-600 focus:outline-none mr-2"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
              
              <Link href="/" className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                <FuelIcon className="text-green-600" />
                <span className="font-bold text-xl">CreatorFuel</span>
              </Link>
            </div>
            
            {/* Center - Navigation (desktop) */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                FAQ
              </Link>
              <Link href="/wall-of-love" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors flex items-center">
                Wall of <HeartIcon className="ml-1" />
              </Link>
              <div className="relative group">
                <button className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors flex items-center">
                  Resources <ChevronDownIcon />
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-1 w-48 z-50">
                  <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Blog</Link>
                  <Link href="/guides" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Guides</Link>
                  <Link href="/success" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Success Stories</Link>
                </div>
              </div>
            </nav>

            {/* Right Side - Search & Auth */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon />
                </div>
                 <input 
                  type="search" 
                  placeholder="Search creators..." 
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 w-48 lg:w-64 transition-all"
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
              
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  <Link 
                    href={route('dashboard')} 
                    className="px-4 py-2 text-sm font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      href={route('login')} 
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link 
                      href={route('register')} 
                      className="px-4 py-2 text-sm font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
          {/* Floating Creator Cards */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {creatorData.map(creator => (
              <CreatorCard key={creator.name} {...creator} />
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="flex justify-center items-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} />
              ))}
              <span className="text-sm font-medium text-gray-600 ml-1">
                Loved by 1M+ creators worldwide
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
                Fund your creative work
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Accept support from your fans. Start a membership. Sell your creations. 
              All with one simple platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href={user ? route('dashboard') : route('register')} 
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-bold rounded-full hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start my page — it's free
              </Link>
              <Link 
                href="/how-it-works" 
                className="px-8 py-4 border-2 border-green-600 text-green-600 text-lg font-bold rounded-full hover:bg-green-50 transition-colors"
              >
                How it works
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              Set up in under 2 minutes • No credit card required
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Welcome;