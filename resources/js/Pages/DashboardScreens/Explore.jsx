// resources/js/Pages/Explore.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';

// --- Reusable Components for this Page ---

const TabButton = ({ children, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2.5 text-sm sm:text-base font-semibold transition-colors duration-200 ${
            isActive
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-800'
        }`}
    >
        {children}
    </button>
);

const CreatorRow = ({ rank, name, avatarUrl, description, supporters }) => {
    // A helper to format large numbers
    const formatSupporters = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toLocaleString();
    };

    return (
        <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
            <span className="text-lg font-bold text-gray-300 w-6 text-center">#{rank}</span>
            {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                    {name.charAt(0)}
                </div>
            )}
            <div className="flex-1">
                <h3 className="font-bold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-600 truncate">{description}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <HeartIcon className="w-3 h-3 mr-1" /> {formatSupporters(supporters)} Supporters
                </p>
            </div>
        </div>
    );
};


// --- Main Explore Page Component ---
export default function Explore({ auth }) {
    const [activeTab, setActiveTab] = useState('explore');

    // MOCK DATA: This would come from your backend controller
    const trendingCreators = [
        { id: 1, rank: 1, name: 'Simple Politics', avatarUrl: null, description: 'Helping people have better conversations about politics', supporters: 9850 },
        { id: 2, rank: 2, name: 'Cara', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', description: 'Building a new platform for artists', supporters: 6182 },
        { id: 3, rank: 3, name: 'Beach Talk Radio', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', description: 'A Dinky Little Podcast', supporters: 1609 },
        { id: 4, rank: 4, name: 'Tanaka san', avatarUrl: 'https://images.unsplash.com/photo-1610276198568-eb6d0ff53e48?w=100', description: 'Teaching Japanese on YouTube & Instagram', supporters: 512 },
        { id: 5, rank: 5, name: 'Kaleigh Cohen', avatarUrl: 'https://images.unsplash.com/photo-1580894908361-967195033215?w=100', description: 'Creating indoor cycling and strength workouts', supporters: 3491 },
        { id: 6, rank: 6, name: 'Drumscribe', avatarUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100', description: 'Posting drum play-through videos with sheet music', supporters: 672 },
        { id: 7, rank: 7, name: 'Mind Over This Matrix', avatarUrl: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=100', description: 'Creating Manifestation and Self Improvement content', supporters: 426 },
        { id: 8, rank: 8, name: 'Serina Higgins', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', description: 'Writing Short Stories, Academic Books, & Scholarship', supporters: 44 },
    ];


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Explore Creators" />

            <div className="max-w-4xl mx-auto">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton isActive={activeTab === 'explore'} onClick={() => setActiveTab('explore')}>
                            Explore creators
                        </TabButton>
                        <TabButton isActive={activeTab === 'following'} onClick={() => setActiveTab('following')}>
                            Following
                        </TabButton>
                    </nav>
                </div>

                {/* Search Bar */}
                <div className="mt-6 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full rounded-full border-0 bg-white py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-sm sm:leading-6"
                        placeholder="Search 1,000,000+ creators"
                        type="search"
                    />
                </div>

                {/* Conditional Content based on Tab */}
                <div className="mt-8">
                    {activeTab === 'explore' && (
                        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 px-2">Trending creators this week</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
                                {trendingCreators.map((creator) => (
                                    <CreatorRow
                                        key={creator.id}
                                        rank={creator.rank}
                                        name={creator.name}
                                        avatarUrl={creator.avatarUrl}
                                        description={creator.description}
                                        supporters={creator.supporters}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800">Your feed is empty</h3>
                            <p className="mt-2 text-gray-600">Follow creators to see their latest posts here.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}