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

// Transaction Item Component - FIXED metadata access
const TransactionItem = ({ transaction }) => {
    // Safely access metadata
    const metadata = transaction.metadata || {};
    const supporterName = metadata.supporter_name || 
                         metadata.donor_name || 
                         transaction.description?.split('from')?.[1]?.trim() || 
                         'Anonymous Supporter';

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">
                        {supporterName}
                    </p>
                    <p className="text-sm text-gray-500">
                        {transaction.description || 'Support donation'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-green-600">
                    UGX {parseFloat(transaction.amount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                    {transaction.status}
                </p>
            </div>
        </div>
    );
};

// Loading Skeleton
const TransactionSkeleton = () => (
    <div className="animate-pulse flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
        </div>
    </div>
);

export default function Supporters({ auth, stats, transactions, wallet }) {
    const [activeTab, setActiveTab] = useState('one-time');
    const [selectedLayout, setSelectedLayout] = useState('suggested');
    const [isLoading, setIsLoading] = useState(false);
    
    // FIXED: Handle both pagination object and simple array
    const [transactionData, setTransactionData] = useState(
        transactions && transactions.data ? transactions : { data: [], total: 0 }
    );

    // Format currency function
    const formatCurrency = (amount) => {
        return `UGX ${parseFloat(amount || 0).toLocaleString()}`;
    };

    // Load transactions via API
    const loadTransactions = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/supporters/transactions?page=${page}`);
            const data = await response.json();
            setTransactionData(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const OneTimeContent = () => (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                    icon={<HeartIcon className="w-6 h-6" />}
                    value={stats?.totalSupporters || 0}
                    label="Supporters"
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

            {/* Transactions List */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Recent Support</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>All time</span>
                    </div>
                </div>

                {isLoading ? (
                    // Loading state
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <TransactionSkeleton key={i} />
                        ))}
                    </div>
                ) : transactionData.data && transactionData.data.length > 0 ? (
                    // Transactions list
                    <div className="divide-y divide-gray-100">
                        {transactionData.data.map((transaction) => (
                            <TransactionItem 
                                key={transaction.id} 
                                transaction={transaction} 
                            />
                        ))}
                    </div>
                ) : (
                    // Empty state
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
                        <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors">
                            Share Your Page
                        </button>
                    </div>
                )}

                {/* Pagination - Only show if we have pagination data */}
                {transactionData.links && transactionData.data && transactionData.data.length > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                            Showing {transactionData.data.length} of {transactionData.total} transactions
                        </p>
                        <div className="flex gap-2">
                            {transactionData.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && loadTransactions(new URL(link.url).searchParams.get('page'))}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );

    const SettingsContent = () => (
        <div className="space-y-6">
            {/* Your existing SettingsContent remains the same */}
            {/* ... */}
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