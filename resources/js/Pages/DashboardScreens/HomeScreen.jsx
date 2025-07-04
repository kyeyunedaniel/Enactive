// resources/js/Pages/HomeScreen.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ChevronDownIcon, 
    HeartIcon, 
    LockClosedIcon, 
    ShoppingBagIcon, 
    PencilSquareIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components for this page ---

// A generic container card
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// The specific "Action Card" for the "More ways to earn" section
const ActionCard = ({ title, description, buttonText, href, icon }) => (
    <Link href={href}>
        <Card className="h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="bg-yellow-100 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 flex-grow">{description}</p>
            <div className="mt-6 flex items-center justify-between text-sm font-semibold text-gray-700 border border-gray-300 rounded-full p-1 group-hover:bg-gray-800 group-hover:text-white group-hover:border-gray-800 transition-colors">
                <span className="px-3">{buttonText}</span>
                <span className="bg-gray-200 group-hover:bg-gray-600 rounded-full p-1.5 transition-colors">
                     <ArrowRightIcon className="w-4 h-4" />
                </span>
            </div>
        </Card>
    </Link>
);

const formatCurrency = (amount) => new Intl.NumberFormat('en-US').format(amount);

export default function HomeScreen({ auth }) {
    // These values would typically come from your controller/backend.
    // We'll set them here to match the design for a new user.
    const needsPayoutSetup = true; 
    const hasSupporters = false;
    const totalEarnings = 100000000;

    return (
        <AuthenticatedLayout
            user={auth.user}
            showPayoutsBanner={needsPayoutSetup}
            header={
                // This is the dynamic header block from the design
                <div className="flex items-center">
                    <img 
                        className="h-16 w-16 rounded-full object-cover mr-4 bg-gray-200" 
                        src={auth.user.avatar_url || `https://ui-avatars.com/api/?name=${auth.user.name}&background=e2e8f0&color=475569`} 
                        alt={auth.user.name} 
                    />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Hi, {auth.user.name}!
                        </h1>
                        <p className="text-gray-500">
                           creatorfuel.com/{auth.user.username}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Home" />

            <div className="space-y-8">
                {/* Earnings Card */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Earnings</h2>
                        <button className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                            Last 30 days
                            <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-500" />
                        </button>
                    </div>
                    <p className="text-5xl font-extrabold text-gray-900">UGX {formatCurrency(totalEarnings)}</p>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-yellow-300 rounded-full mr-2"></span>UGX 0 Supporters</span>
                        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-pink-300 rounded-full mr-2"></span>UGX 0 Membership</span>
                        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-cyan-300 rounded-full mr-2"></span>UGX 0 Shop</span>
                    </div>
                </Card>

                {/* Empty Supporters Card (Conditionally Rendered) */}
                {!hasSupporters && (
                    <Card className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                            <HeartIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-gray-800">You don't have any supporters yet</h3>
                        <p className="mt-2 text-gray-600">Share your page with your audience to get started.</p>
                    </Card>
                )}

                {/* More ways to earn */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">More ways to earn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ActionCard 
                            title="Membership"
                            description="Monthly membership for your biggest fans and supporters."
                            buttonText="Enable"
                            href={route('dashboard')} // Ensure this route exists
                            icon={<LockClosedIcon className="w-5 h-5 text-yellow-800" />}
                        />
                        <ActionCard 
                            title="Shop"
                            description="Introducing Shop, the creative way to sell."
                            buttonText="Enable"
                            href={route('dashboard')} // Ensure this route exists
                            icon={<ShoppingBagIcon className="w-5 h-5 text-yellow-800" />}
                        />
                        <ActionCard 
                            title="Exclusive posts"
                            description="Publish your best content exclusively for your supporters and members."
                            buttonText="Write a post"
                            href={route('dashboard')} // Ensure this route exists
                            icon={<PencilSquareIcon className="w-5 h-5 text-yellow-800" />}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}