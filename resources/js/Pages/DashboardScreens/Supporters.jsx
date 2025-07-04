// resources/js/Pages/Supporters.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    HeartIcon,
    ClockIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { InformationCircleIcon as SolidInfoIcon } from '@heroicons/react/24/solid';


// --- Reusable Components for this page ---

// A generic container card (reused from your reference)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// A specialized card for the top stats on the "One-time" tab
const StatCard = ({ icon, value, label }) => (
    <Card className="p-4 sm:p-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-gray-400">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    </Card>
);

// A tab button component to handle active/inactive states
const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none transition-colors duration-200 ${
            isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);


export default function Supporters({ auth }) {
    const [activeTab, setActiveTab] = useState('one-time');
    const [selectedLayout, setSelectedLayout] = useState('suggested');
    useEffect(()=>{
        console.log("auth", JSON.stringify(auth) )
    })

    const OneTimeContent = () => (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                    icon={<HeartIcon className="w-6 h-6" />}
                    value="0"
                    label="Supporter"
                />
                <StatCard 
                    icon={<ClockIcon className="w-6 h-6" />}
                    value="$0"
                    label="Last 30 days"
                />
                 <StatCard 
                    icon={<SolidInfoIcon className="w-6 h-6" />}
                    value="$0"
                    label="All-time"
                />
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16">
                 <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                        <HeartIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-800">You don't have any supporters yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Share your page with your audience to get started.</p>
                </div>
            </div>
        </div>
    );

    const SettingsContent = () => (
        <div className="space-y-6">
            {/* Thank you message Card */}
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            Thank you message
                            <InformationCircleIcon className="w-5 h-5 text-gray-400 ml-2" />
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 max-w-md">
                            This will be visible after the payment and in the receipt email. Write a personable thank you message, and include any rewards if you like.
                        </p>
                    </div>
                    <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex-shrink-0">Edit</Link>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <button className="relative bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                        Add a video message
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full uppercase">New!</span>
                    </button>
                    <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Preview message</Link>
                </div>
            </Card>

            {/* Choose a layout Card */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Choose a layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Standard View Option */}
                    <div onClick={() => setSelectedLayout('standard')} className={`p-4 rounded-xl border-2 cursor-pointer ${selectedLayout === 'standard' ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center mb-4">
                            <input type="radio" name="layout" value="standard" checked={selectedLayout === 'standard'} readOnly className="h-4 w-4 text-gray-800 border-gray-300 focus:ring-gray-700" />
                            <span className="ml-3 font-semibold text-gray-800">Standard view</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg pointer-events-none">
                            <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center">Support {auth.user.name} <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1.5" /></p>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">☕</span>
                                <span className="text-sm">x</span>
                                <span className="bg-yellow-400 text-gray-800 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">5</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">10</span>
                            </div>
                            <div className="bg-gray-200 h-10 rounded-md mb-2 text-gray-400 text-sm flex items-center px-3">Name or @yoursocial</div>
                            <div className="bg-gray-200 h-16 rounded-md mb-3 text-gray-400 text-sm flex items-start px-3 py-2">Say something nice</div>
                            <div className="bg-yellow-400 h-11 rounded-lg text-gray-800 font-semibold flex items-center justify-center">Support</div>
                        </div>
                    </div>
                    {/* Suggested Amounts Option */}
                    <div onClick={() => setSelectedLayout('suggested')} className={`p-4 rounded-xl border-2 cursor-pointer ${selectedLayout === 'suggested' ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center mb-4">
                            <input type="radio" name="layout" value="suggested" checked={selectedLayout === 'suggested'} readOnly className="h-4 w-4 text-gray-800 border-gray-300 focus:ring-gray-700" />
                            <span className="ml-3 font-semibold text-gray-800">Suggested amounts</span>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg pointer-events-none">
                            <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center">Support {auth.user.username} <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1.5" /></p>
                            <div className="bg-gray-200 h-10 rounded-md mb-2 flex items-center justify-between px-3 text-gray-400 text-sm">
                                <span>$ Enter amount</span>
                                <div className="flex gap-1 text-gray-600 text-xs">
                                    <span className="bg-gray-300 px-1.5 py-0.5 rounded">+25</span>
                                    <span className="bg-gray-300 px-1.5 py-0.5 rounded">+50</span>
                                    <span className="bg-gray-300 px-1.5 py-0.5 rounded">+100</span>
                                </div>
                            </div>
                            <div className="bg-gray-200 h-10 rounded-md mb-2 text-gray-400 text-sm flex items-center px-3">Name or @yoursocial</div>
                            <div className="bg-gray-200 h-16 rounded-md mb-3 text-gray-400 text-sm flex items-start px-3 py-2">Say something nice</div>
                            <div className="bg-yellow-400 h-11 rounded-lg text-gray-800 font-semibold flex items-center justify-center">Support</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Button wording Card */}
            <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        Button wording
                        <InformationCircleIcon className="w-5 h-5 text-gray-400 ml-2" />
                    </h3>
                    <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Edit</Link>
                </div>
                <p className="mt-1 text-sm text-gray-600">Support</p>
            </Card>
        </div>
    );


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Supporters
                </h1>
            }
        >
            <Head title="Supporters" />

            {/* Floating Help Button */}
            <button className="fixed bottom-6 right-6 bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50">
                <QuestionMarkCircleIcon className="w-7 h-7" />
            </button>

            <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
                    <TabButton isActive={activeTab === 'one-time'} onClick={() => setActiveTab('one-time')}>
                        One-time
                    </TabButton>
                    <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                        Settings
                    </TabButton>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'one-time' && <OneTimeContent />}
                    {activeTab === 'settings' && <SettingsContent />}
                </div>
            </div>

        </AuthenticatedLayout>
    );
}