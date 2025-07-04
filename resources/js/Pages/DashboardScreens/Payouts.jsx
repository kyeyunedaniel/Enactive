// resources/js/Pages/PayoutsScreen.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    BanknotesIcon, 
    ClockIcon, 
    DevicePhoneMobileIcon,
    PencilIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components ---

const Card = ({ children, className = '', title, description }) => (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 ${className}`}>
        {title && (
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
        )}
        {children}
    </div>
);

const Input = ({ id, label, type, value, onChange, error, prefix, className = '', ...props }) => (
    <div className="mb-4">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative rounded-md shadow-sm">
            {prefix && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">{prefix}</span>
                </div>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600 ${prefix ? 'pl-12' : ''} ${className}`}
                {...props}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const PrimaryButton = ({ children, onClick, disabled = false, className = '', isLoading = false }) => (
    <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center px-6 py-3 bg-green-600 border border-transparent rounded-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${(disabled || isLoading) ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
    >
        {isLoading ? (
            <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Processing...
            </>
        ) : children}
    </button>
);

const StatusBadge = ({ status }) => {
    const statusConfig = {
        Completed: { color: 'bg-green-100 text-green-800', icon: CheckIcon },
        Pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
        Failed: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };

    const { color, icon: Icon } = statusConfig[status] || statusConfig.Pending;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {status}
        </span>
    );
};

export default function PayoutsScreen({ auth, availableBalance, payoutMethod, payoutHistory }) {
    // Mock data fallback
    const MOCK_DATA = {
        availableBalance: 525500,
        payoutMethod: { number: '0771234567', provider: 'MTN' },
        payoutHistory: [
            { id: 1, amount: 150000, status: 'Completed', date: '2023-10-15', method: 'MTN (**** 4567)' },
            { id: 2, amount: 200000, status: 'Pending', date: '2023-11-01', method: 'Airtel (**** 1122)' },
            { id: 3, amount: 75000, status: 'Completed', date: '2023-09-22', method: 'MTN (**** 4567)' },
        ]
    };

    availableBalance = availableBalance ?? MOCK_DATA.availableBalance;
    payoutMethod = payoutMethod ?? MOCK_DATA.payoutMethod;
    payoutHistory = payoutHistory ?? MOCK_DATA.payoutHistory;

    const [isEditingMethod, setIsEditingMethod] = useState(!payoutMethod);
    const [amountError, setAmountError] = useState('');

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, errors: withdrawalErrors, reset: resetWithdrawal } = useForm({
        amount: '',
    });

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, errors: methodErrors, reset: resetMethod } = useForm({
        number: payoutMethod?.number || '',
        provider: payoutMethod?.provider || 'MTN',
    });

    // Validate amount doesn't exceed available balance
    useEffect(() => {
        if (withdrawalData.amount && parseFloat(withdrawalData.amount) ){
            if (parseFloat(withdrawalData.amount) > availableBalance) {
                setAmountError('Amount exceeds your available balance');
            } else if (parseFloat(withdrawalData.amount) < 10000) {
                setAmountError('Minimum withdrawal is UGX 10,000');
            } else {
                setAmountError('');
            }
        } else {
            setAmountError('');
        }
    }, [withdrawalData.amount, availableBalance]);

    const handleWithdrawalSubmit = (e) => {
        e.preventDefault();
        if (amountError) return;
        
        postWithdrawal(route('payouts.store'), {
            onSuccess: () => resetWithdrawal(),
        });
    };
    
    const handleMethodSubmit = (e) => {
        e.preventDefault();
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
                        Withdraw your earnings and manage your payout settings
                    </p>
                </div>
            }
        >
            <Head title="Payouts" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Available Balance */}
                    <Card>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available Balance</h3>
                                <p className="text-4xl font-bold text-gray-900 mt-1">
                                    UGX {formatCurrency(availableBalance)}
                                </p>
                            </div>
                            <div className="bg-green-50 text-green-800 p-3 rounded-lg">
                                <p className="text-sm font-medium">Minimum withdrawal: UGX 10,000</p>
                            </div>
                        </div>
                    </Card>

                    {/* Request a Withdrawal */}
                    <Card title="Request Withdrawal" description="Funds will be sent to your registered mobile number">
                        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                            <Input
                                id="amount"
                                label="Amount (UGX)"
                                type="number"
                                value={withdrawalData.amount}
                                onChange={(e) => setWithdrawalData('amount', e.target.value)}
                                prefix="UGX"
                                error={amountError || withdrawalErrors.amount}
                                min="10000"
                                max={availableBalance}
                                disabled={!payoutMethod || processingWithdrawal}
                            />
                            
                            {!payoutMethod && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                        <p className="ml-3 text-sm text-yellow-700">
                                            Please set up a payout method before requesting a withdrawal.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <PrimaryButton 
                                    disabled={!payoutMethod || processingWithdrawal || !withdrawalData.amount || !!amountError}
                                    isLoading={processingWithdrawal}
                                >
                                    Request Payout
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>

                    {/* Payout History */}
                    <Card title="Payout History">
                        {payoutHistory.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Method</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {payoutHistory.map((payout) => (
                                            <tr key={payout.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                    UGX {formatCurrency(payout.amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {payout.method}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {payout.date}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <StatusBadge status={payout.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                                    <BanknotesIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-gray-800">No payout history</h3>
                                <p className="mt-1 text-gray-600">Your past withdrawals will appear here</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Side Content (Right) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Payout Method">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-900">Mobile Money Details</h3>
                            {payoutMethod && !isEditingMethod && (
                                <button 
                                    onClick={() => setIsEditingMethod(true)} 
                                    className="text-green-600 hover:text-green-800"
                                    aria-label="Edit payout method"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        
                        {isEditingMethod ? (
                            <form onSubmit={handleMethodSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">Mobile Network</label>
                                    <select 
                                        id="provider"
                                        value={methodData.provider}
                                        onChange={(e) => setMethodData('provider', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600"
                                    >
                                        <option value="MTN">MTN Mobile Money</option>
                                        <option value="Airtel">Airtel Money</option>
                                    </select>
                                    {methodErrors.provider && <p className="mt-1 text-sm text-red-600">{methodErrors.provider}</p>}
                                </div>
                                
                                <Input
                                    id="number"
                                    label="Mobile Number"
                                    type="tel"
                                    placeholder="07XXXXXXXX"
                                    value={methodData.number}
                                    onChange={(e) => setMethodData('number', e.target.value)}
                                    error={methodErrors.number}
                                />
                                
                                <div className="flex items-center justify-end space-x-3 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditingMethod(false); resetMethod(); }} 
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <PrimaryButton isLoading={processingMethod}>
                                        Save Changes
                                    </PrimaryButton>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {payoutMethod ? (
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg mr-4">
                                            <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{payoutMethod.provider} Mobile Money</p>
                                            <p className="text-gray-600">{payoutMethod.number}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No payout method set up yet</p>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Help Card */}
                    <Card title="Need Help?">
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <ClockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="ml-3 text-sm text-gray-600">
                                    Payouts are processed within <span className="font-medium">1-3 business days</span>.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="ml-3 text-sm text-gray-600">
                                    Ensure your mobile number is correct to avoid failed transactions.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}