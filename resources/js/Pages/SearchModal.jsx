// resources/js/Components/SearchModal.jsx

import React, { useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { IoFlame } from 'react-icons/io5';

// --- MOCK DATA (Unchanged) ---
const creators = [
    { rank: 1, name: 'Simple Politics', description: 'Helping people have better conversations about politics' },
    { rank: 2, name: 'Cara', description: 'building a new platform for artists' },
    { rank: 3, name: 'Beach Talk Radio', description: 'A Dinky Little Podcast' },
    { rank: 4, name: 'Tanaka san', description: 'teaching Japanese on YouTube & Instagram' },
    { rank: 5, name: 'Kaleigh Cohen', description: 'creating indoor cycling and strength workouts on YouTube!' },
    { rank: 6, name: 'Drumscribe', description: 'posting drum play-through videos with sheet music PDF & GP files!' },
    { rank: 7, name: 'Mind Over This Matrix', description: 'creating Manifestation and Self Improvement content to help you thrive' },
    { rank: 8, name: 'Sørina Higgins', description: 'Exploring the works of C.S. Lewis & The Inklings' },
];

// --- Avatar Component (Unchanged) ---
const Avatar = ({ name }) => {
  const getInitials = (nameStr) => {
    const words = nameStr.split(' ');
    if (words.length > 1) return words[0].charAt(0) + words[1].charAt(0);
    return nameStr.slice(0, 2);
  };
  const isSpecial = name === 'Simple Politics' || name === 'Cara';
  const avatarClass = `h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl relative shrink-0 ${
    isSpecial ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
  }`;

  return (
    <div className={avatarClass}>
      {getInitials(name)}
      {name === 'Simple Politics' && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-teal-400 rounded-full" />
      )}
    </div>
  );
};

// --- List Item Component (Unchanged) ---
const CreatorListItem = ({ creator }) => (
  <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
    <div className="w-8 text-center text-gray-400 font-semibold">#{creator.rank}</div>
    <Avatar name={creator.name} />
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-semibold text-gray-900 truncate">{creator.name}</h3>
      <p className="text-sm text-gray-500 truncate">{creator.description}</p>
    </div>
  </div>
);

// --- Main Modal Component (UPDATED FOR RESPONSIVENESS) ---
const SearchModal = ({ isOpen, onClose }) => {
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input on open
      searchInputRef.current?.focus();
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll on close
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Ensure body scroll is re-enabled when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-start sm:items-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"></div>

      {/* Modal content with responsive classes */}
      <div 
        ref={modalRef}
        className="relative bg-white shadow-xl transform transition-all w-full h-full flex flex-col sm:w-full sm:max-w-xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Section: Search Bar & Close Button (Responsive Layout) */}
        <div className="p-4 border-b border-gray-200 sm:p-5 sm:border-b-0">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    className="block w-full bg-gray-100 rounded-lg pl-11 pr-12 py-3 border-transparent focus:ring-0 focus:border-transparent text-base placeholder-gray-500"
                    placeholder="Search creators"
                />
                 <button 
                    onClick={onClose}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-800"
                >
                    <FiX className="h-6 w-6" />
                </button>
            </div>
        </div>
        
        {/* Main Scrollable Content */}
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 overflow-y-auto">
          {/* Trending Section */}
          <div className="flex items-center mt-4 mb-3 sm:mb-4">
            <IoFlame className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900 ml-2">Trending</h2>
          </div>
          
          {/* Creators List */}
          <div className="space-y-1">
            {creators.map((creator) => (
              <CreatorListItem key={creator.rank} creator={creator} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;