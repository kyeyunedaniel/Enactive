// resources/js/Pages/DashboardScreens/Supporters.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    HeartIcon,
    ClockIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    CalendarIcon,
    ArrowTopRightOnSquareIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { InformationCircleIcon as SolidInfoIcon } from '@heroicons/react/24/solid';

// --- Reusable Components ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

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

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
    const supporterName = transaction.supporter_name || 
                         transaction.metadata?.supporter_name || 
                         transaction.metadata?.donor_name || 
                         'Anonymous Supporter';

    const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const formattedAmount = `UGX ${parseFloat(transaction.amount).toLocaleString()}`;

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                        {supporterName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                        {transaction.description || 'Support donation'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {formattedDate}
                    </p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-bold text-green-600 text-sm sm:text-base">
                    {formattedAmount}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {transaction.status}
                </span>
            </div>
        </div>
    );
};

// Quick Action Button Component
const QuickActionButton = ({ icon, label, description, onClick, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-yellow-400 hover:bg-yellow-500 text-gray-800',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        success: 'bg-green-500 hover:bg-green-600 text-white'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 p-4 rounded-xl transition-colors duration-200 text-left w-full ${variants[variant]}`}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-80">{description}</p>
            </div>
        </button>
    );
};

// Support Link Card Component
const SupportLinkCard = ({ publicUrlName }) => {
    const supportUrl = `${window.location.origin}/support/${publicUrlName}`;
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(supportUrl);
        // You can add a toast notification here
        // alert('Support link copied to clipboard!');
    };

    const openPreview = () => {
        window.open(supportUrl, '_blank');
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Support Link</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 break-all">{supportUrl}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ShareIcon className="w-4 h-4" />
                        Copy
                    </button>
                    <button
                        onClick={openPreview}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        Preview
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default function Supporters({ auth, stats, transactions, wallet }) {
    const [activeTab, setActiveTab] = useState('one-time');
    const [selectedLayout, setSelectedLayout] = useState('suggested');

    // Get last 5 transactions from props
    const recentTransactions = transactions?.data?.slice(0, 5) || [];

    // Format currency function
    const formatCurrency = (amount) => {
        return `UGX ${parseFloat(amount || 0).toLocaleString()}`;
    };

    const OneTimeContent = () => (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                    icon={<HeartIcon className="w-6 h-6" />}
                    value={stats?.totalSupporters || 0}
                    label="Supporters Count"
                />
                <StatCard 
                    icon={<ClockIcon className="w-6 h-6" />}
                    value={formatCurrency(stats?.last30DaysAmount)}
                    label="Last 30 days"
                />
                <StatCard 
                    icon={<SolidInfoIcon className="w-6 h-6" />}
                    value={formatCurrency(stats?.allTimeAmount)}
                    label="All-time"
                />
            </div>

            {/* Quick Actions Section */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionButton
                    icon={<ShareIcon className="w-6 h-6" />}
                    label="Share Your Page"
                    description="Get your unique link to share with supporters"
                    variant="primary"
                    onClick={() => {
                        const url = `${window.location.origin}/support/${auth.user.public_url_name}`;
                        navigator.clipboard.writeText(url);
                        // alert('Support link copied to clipboard!');
                    }}
                />
                <QuickActionButton
                    icon={<ArrowTopRightOnSquareIcon className="w-6 h-6" />}
                    label="Preview Page"
                    description="See how your supporters view your page"
                    variant="secondary"
                    onClick={() => window.open(`/support/${auth.user.public_url_name}`, '_blank')}
                />
            </div> */}

            {/* Support Link Card */}
            <SupportLinkCard publicUrlName={auth.user.public_url_name} />

            {/* Recent Transactions Section */}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Recent Support</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Last 5 transactions</span>
                    </div>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentTransactions.map((transaction) => (
                            <TransactionItem 
                                key={transaction.id} 
                                transaction={transaction} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                            <HeartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-800">
                            No supporters yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                            Share your support page with your audience to receive donations. 
                            Your supporters will appear here once they make contributions.
                        </p>
                        <button 
                            className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                            onClick={() => {
                                const url = `${window.location.origin}/support/${auth.user.public_url_name}`;
                                navigator.clipboard.writeText(url);
                                // alert('Support link copied to clipboard! Share it with your audience.');
                            }}
                        >
                            Copy Support Link
                        </button>
                    </div>
                )}

                {/* View All Transactions Link */}
                {transactions?.data?.length > 5 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Link 
                            href="/transactions" 
                            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <span>View all transactions</span>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </Card>

            {/* Tips Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Tips to Get More Supporters</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p>• Share your support link on social media platforms</p>
                    <p>• Add the link to your YouTube/TikTok/Instagram bio</p>
                    <p>• Mention it in your content and live streams</p>
                    <p>• Offer exclusive content or perks for supporters</p>
                    <p>• Engage with your supporters regularly</p>
                </div>
            </Card>
        </div>
    );

    const SettingsContent = () => (
        <div className="space-y-6">
            {/* Thank you message Card */}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            Thank you message
                            <InformationCircleIcon className="w-5 h-5 text-gray-400 ml-2" />
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 max-w-md">
                            This will be visible after the payment and in the receipt email. Write a personable thank you message, and include any rewards if you like.
                        </p>
                    </div>
                    <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex-shrink-0 whitespace-nowrap">Edit</Link>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <button className="relative bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
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
                    <div 
                        onClick={() => setSelectedLayout('standard')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                            selectedLayout === 'standard' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center mb-4">
                            <input 
                                type="radio" 
                                name="layout" 
                                value="standard" 
                                checked={selectedLayout === 'standard'} 
                                readOnly 
                                className="h-4 w-4 text-gray-800 border-gray-300 focus:ring-gray-700" 
                            />
                            <span className="ml-3 font-semibold text-gray-800">Standard view</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg pointer-events-none">
                            <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                                Support {auth.user.name} 
                                <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1.5" />
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">☕</span>
                                <span className="text-sm">x</span>
                                <span className="bg-yellow-400 text-gray-800 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">5</span>
                                <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">10</span>
                            </div>
                            <div className="bg-gray-100 h-10 rounded-md mb-2 text-gray-400 text-sm flex items-center px-3">Name or @yoursocial</div>
                            <div className="bg-gray-100 h-16 rounded-md mb-3 text-gray-400 text-sm flex items-start px-3 py-2">Say something nice</div>
                            <div className="bg-yellow-400 h-11 rounded-lg text-gray-800 font-semibold flex items-center justify-center">Support</div>
                        </div>
                    </div>
                    
                    {/* Suggested Amounts Option */}
                    <div 
                        onClick={() => setSelectedLayout('suggested')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                            selectedLayout === 'suggested' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center mb-4">
                            <input 
                                type="radio" 
                                name="layout" 
                                value="suggested" 
                                checked={selectedLayout === 'suggested'} 
                                readOnly 
                                className="h-4 w-4 text-gray-800 border-gray-300 focus:ring-gray-700" 
                            />
                            <span className="ml-3 font-semibold text-gray-800">Suggested amounts</span>
                        </div>
                         <div className="bg-white p-4 rounded-lg pointer-events-none">
                            <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                                Support {auth.user.public_url_name} 
                                <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1.5" />
                            </p>
                            <div className="bg-gray-100 h-10 rounded-md mb-2 flex items-center justify-between px-3 text-gray-400 text-sm">
                                <span>$ Enter amount</span>
                                <div className="flex gap-1 text-gray-600 text-xs">
                                    <span className="bg-gray-200 px-1.5 py-0.5 rounded">+25</span>
                                    <span className="bg-gray-200 px-1.5 py-0.5 rounded">+50</span>
                                    <span className="bg-gray-200 px-1.5 py-0.5 rounded">+100</span>
                                </div>
                            </div>
                            <div className="bg-gray-100 h-10 rounded-md mb-2 text-gray-400 text-sm flex items-center px-3">Name or @yoursocial</div>
                            <div className="bg-gray-100 h-16 rounded-md mb-3 text-gray-400 text-sm flex items-start px-3 py-2">Say something nice</div>
                            <div className="bg-yellow-400 h-11 rounded-lg text-gray-800 font-semibold flex items-center justify-center">Support</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Button wording Card */}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            Button wording
                            <InformationCircleIcon className="w-5 h-5 text-gray-400 ml-2" />
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">Support</p>
                    </div>
                    <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900 whitespace-nowrap">Edit</Link>
                </div>
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
            <button 
                className="fixed bottom-6 right-6 bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50"
                onClick={() => window.open('/help/supporters', '_blank')}
            >
                <QuestionMarkCircleIcon className="w-7 h-7" />
            </button>

            <div className="space-y-6 pb-6">
                {/* Tabs */}
                <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
                    <TabButton 
                        isActive={activeTab === 'one-time'} 
                        onClick={() => setActiveTab('one-time')}
                    >
                        One-time
                    </TabButton>
                    <TabButton 
                        isActive={activeTab === 'settings'} 
                        onClick={() => setActiveTab('settings')}
                    >
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