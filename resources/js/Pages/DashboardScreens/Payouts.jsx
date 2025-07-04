// resources/js/Pages/PayoutsScreen.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BanknotesIcon, 
    ClockIcon, 
    DevicePhoneMobileIcon,
    PencilIcon,
    XMarkIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

// --- Reusable Components (can be shared or kept local) ---

// A generic container card, same as in HomeScreen.jsx
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// Form Input component for cleaner forms
const Input = ({ id, type, value, onChange, className = '', ...props }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`}
        {...props}
    />
);

// Primary Button component
const PrimaryButton = ({ children, onClick, disabled = false, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${disabled && 'opacity-25'} ${className}`}
    >
        {children}
    </button>
);


export default function PayoutsScreen({ auth, availableBalance, payoutMethod, payoutHistory }) {
    // --- Mock Data (replace with props from your controller) ---
    // These values would typically come from your controller.
    const MOCK_DATA = {
        availableBalance: 525500,
        payoutMethod: { number: '0771234567', provider: 'MTN' }, // or null
        payoutHistory: [
            { id: 1, amount: 150000, status: 'Completed', date: '2023-10-15', method: 'MTN (**** 4567)' },
            { id: 2, amount: 200000, status: 'Pending', date: '2023-11-01', method: 'Airtel (**** 1122)' },
            { id: 3, amount: 75000, status: 'Completed', date: '2023-09-22', method: 'MTN (**** 4567)' },
        ] // or []
    };
    // Use mock data if props are not provided
    availableBalance = availableBalance ?? MOCK_DATA.availableBalance;
    payoutMethod = payoutMethod ?? MOCK_DATA.payoutMethod;
    payoutHistory = payoutHistory ?? MOCK_DATA.payoutHistory;
    // --- End Mock Data ---

    const [isEditingMethod, setIsEditingMethod] = useState(!payoutMethod);

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, errors: withdrawalErrors, reset: resetWithdrawal } = useForm({
        amount: '',
    });

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, errors: methodErrors, reset: resetMethod } = useForm({
        number: payoutMethod?.number || '',
        provider: payoutMethod?.provider || 'MTN',
    });
    
    const handleWithdrawalSubmit = (e) => {
        e.preventDefault();
        // POST to your withdrawal route
        postWithdrawal(route('payouts.store'), {
            onSuccess: () => resetWithdrawal(),
        });
    };
    
    const handleMethodSubmit = (e) => {
        e.preventDefault();
        // POST to your payout method update route
        postMethod(route('payouts.method.update'), {
            onSuccess: () => setIsEditingMethod(false),
        });
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US').format(amount);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Payouts
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Withdraw your earnings and manage your payout settings.
                    </p>
                </div>
            }
        >
            <Head title="Payouts" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Available Balance */}
                    <Card>
                        <h2 className="font-bold text-gray-500 uppercase tracking-wider text-sm">Available for Payout</h2>
                        <p className="text-5xl font-extrabold text-gray-900 mt-2">
                            UGX {formatCurrency(availableBalance)}
                        </p>
                    </Card>

                    {/* Request a Withdrawal */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Request a Withdrawal</h2>
                        <p className="text-sm text-gray-600 mb-6">Funds will be sent to your registered mobile number. Minimum withdrawal is UGX 10,000.</p>
                        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (UGX)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">UGX</span>
                                    </div>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={withdrawalData.amount}
                                        onChange={(e) => setWithdrawalData('amount', e.target.value)}
                                        className="pl-12"
                                        placeholder="0.00"
                                        disabled={!payoutMethod || processingWithdrawal}
                                    />
                                </div>
                                {withdrawalErrors.amount && <p className="text-sm text-red-600 mt-2">{withdrawalErrors.amount}</p>}
                                {!payoutMethod && <p className="text-sm text-yellow-700 mt-2">Please set up a payout method before requesting a withdrawal.</p>}
                            </div>
                            <PrimaryButton disabled={!payoutMethod || processingWithdrawal || !withdrawalData.amount}>
                                {processingWithdrawal ? 'Processing...' : 'Request Payout'}
                            </PrimaryButton>
                        </form>
                    </Card>

                    {/* Payout History */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payout History</h2>
                        {payoutHistory.length > 0 ? (
                            <div className="flow-root">
                                <ul role="list" className="-my-4 divide-y divide-gray-200">
                                    {payoutHistory.map((payout) => (
                                        <li key={payout.id} className="flex items-center py-4 space-x-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payout.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                                {payout.status === 'Completed' ? <CheckIcon className="h-5 w-5 text-green-600" /> : <ClockIcon className="h-5 w-5 text-yellow-600" />}
                                            </div>
                                            <div className="flex-auto">
                                                <p className="text-gray-800 font-semibold">UGX {formatCurrency(payout.amount)}</p>
                                                <p className="text-sm text-gray-500">{payout.method}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${payout.status === 'Completed' ? 'text-green-700' : 'text-yellow-700'}`}>{payout.status}</p>
                                                <p className="text-xs text-gray-500">{payout.date}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                                    <BanknotesIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-gray-800">No payout history</h3>
                                <p className="mt-1 text-gray-600">Your past withdrawals will appear here.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Side Content (Right) */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold text-gray-800">Payout Method</h2>
                             {payoutMethod && !isEditingMethod && (
                                <button onClick={() => setIsEditingMethod(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                             )}
                        </div>
                        
                        {isEditingMethod ? (
                            <form onSubmit={handleMethodSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Mobile Network</label>
                                    <select 
                                        id="provider"
                                        value={methodData.provider}
                                        onChange={(e) => setMethodData('provider', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option>MTN</option>
                                        <option>Airtel</option>
                                    </select>
                                    {methodErrors.provider && <p className="text-sm text-red-600 mt-2">{methodErrors.provider}</p>}
                                </div>
                                <div>
                                    <label htmlFor="number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                    <Input
                                        id="number"
                                        type="tel"
                                        placeholder="07..."
                                        value={methodData.number}
                                        onChange={(e) => setMethodData('number', e.target.value)}
                                        className="mt-1"
                                    />
                                    {methodErrors.number && <p className="text-sm text-red-600 mt-2">{methodErrors.number}</p>}
                                </div>
                                <div className="flex items-center justify-end space-x-2 pt-2">
                                     <button type="button" onClick={() => { setIsEditingMethod(false); resetMethod(); }} className="text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                                     <PrimaryButton disabled={processingMethod}>
                                        {processingMethod ? 'Saving...' : 'Save'}
                                     </PrimaryButton>
                                </div>
                            </form>
                        ) : (
                             <div className="mt-6 flex items-center bg-gray-50 p-4 rounded-lg">
                                <DevicePhoneMobileIcon className="w-8 h-8 text-gray-500 mr-4" />
                                <div>
                                    <p className="font-semibold text-gray-800">{payoutMethod.provider} Mobile Money</p>
                                    <p className="text-gray-600">{payoutMethod.number}</p>
                                </div>
                             </div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}