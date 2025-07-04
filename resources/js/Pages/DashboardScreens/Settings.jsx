// resources/js/Pages/Settings.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    QuestionMarkCircleIcon,
    CheckIcon,
    ArrowPathIcon,
    Cog6ToothIcon,
    BellIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    ShieldCheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components ---

const Card = ({ children, className = '', title = '', description = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 ${className}`}>
        {title && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
        )}
        {children}
    </div>
);

const Tab = ({ children, isActive, icon: Icon }) => (
    <Link 
        href="#" 
        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors duration-200 ${
            isActive 
                ? 'text-green-700 border-green-700'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-green-700' : 'text-gray-500'}`} />}
        {children}
    </Link>
);

const ToggleSwitch = ({ enabled, setEnabled, label, description }) => (
    <div className="flex items-start justify-between">
        <div className="mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${
                enabled ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={enabled}
            aria-labelledby={`${label}-label`}
        >
            <span
                aria-hidden="true"
                className={`${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

const CheckboxRow = ({ id, label, description, checked, onChange }) => (
    <div className="flex items-start">
        <div className="flex items-center h-5">
            <input 
                id={id} 
                type="checkbox" 
                checked={checked} 
                onChange={onChange} 
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
            {description && <p className="text-gray-500">{description}</p>}
        </div>
    </div>
);

const VerificationBadge = ({ verified, onVerify, onResend, loading = false }) => (
    <div className="flex items-center gap-2">
        {verified ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <ShieldCheckIcon className="w-3 h-3" />
                Verified
            </span>
        ) : (
            <>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <XMarkIcon className="w-3 h-3" />
                    Not Verified
                </span>
                <button 
                    onClick={onVerify}
                    disabled={loading}
                    className="text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Verify Now'}
                </button>
                {onResend && (
                    <button 
                        onClick={onResend}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                        Resend Code
                    </button>
                )}
            </>
        )}
    </div>
);

export default function Settings({ auth }) {
    // State for active tab
    const [activeTab, setActiveTab] = useState('notifications');
    
    // State for verification
    const [verificationStep, setVerificationStep] = useState({
        email: auth.user.email_verified_at ? 'verified' : 'unverified',
        phone: auth.user.phone_verified_at ? 'verified' : 'unverified'
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationType, setVerificationType] = useState(''); // 'email' or 'phone'
    
    // Form for account settings
    const { data: accountData, setData: setAccountData, put: updateAccount } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
    });

    // State for notification settings
    const [notifications, setNotifications] = useState({
        enableAll: false,
        newSupporter: true,
        newComment: false,
        monthlySummary: true,
    });
    
    const [emailLimit, setEmailLimit] = useState('unlimited');
    const [isSaving, setIsSaving] = useState(false);

    const handleCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setNotifications(prev => ({ ...prev, [id]: checked }));
    };

    const handleVerify = (type) => {
        setVerificationType(type);
        setShowVerificationModal(true);
        // In a real app, you would send the verification code here
    };

    const handleResendCode = () => {
        // API call to resend verification code
    };

    const handleSubmitVerification = () => {
        // API call to verify the code
        if (verificationCode === '123456') { // Mock verification
            setVerificationStep(prev => ({
                ...prev,
                [verificationType]: 'verified'
            }));
            setShowVerificationModal(false);
            setVerificationCode('');
        }
    };

    const handleAccountSubmit = (e) => {
        e.preventDefault();
        updateAccount(route('profile.update'), {
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const RadioPill = ({ id, name, value, label, checked, onChange, icon: Icon }) => (
    <label htmlFor={id} className="flex-1 min-w-[120px]">
        <input 
            id={id}
            type="radio" 
            name={name} 
            value={value} 
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
        />
        <div className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
            checked 
                ? 'border-green-600 bg-green-50 ring-1 ring-green-600' 
                : 'border-gray-200 hover:border-gray-300'
        } text-center`}>
            {Icon && (
                <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                    checked ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <span className={`text-sm ${checked ? 'font-semibold text-green-700' : 'text-gray-600'}`}>
                {label}
            </span>
        </div>
    </label>
);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Account Settings
                    </h1>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString()}
                    </div>
                </div>
            }
        >
            <Head title="Settings" />
            
            {/* Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                Verify your {verificationType}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowVerificationModal(false);
                                    setVerificationCode('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            We've sent a 6-digit code to your {verificationType}. Please enter it below:
                        </p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter verification code"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600"
                                maxLength="6"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowVerificationModal(false);
                                        setVerificationCode('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitVerification}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Help Button */}
            <button 
                className="fixed bottom-6 right-6 bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-40 group"
                aria-label="Help"
            >
                <QuestionMarkCircleIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>

            <div className="max-w-4xl mx-auto">
                {/* Settings Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                            <Tab 
                                isActive={activeTab === 'account'} 
                                icon={Cog6ToothIcon}
                                onClick={() => setActiveTab('account')}
                            >
                                Account
                            </Tab>
                            <Tab 
                                isActive={activeTab === 'notifications'} 
                                icon={BellIcon}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Notifications
                            </Tab>
                            <Tab 
                                isActive={activeTab === 'security'} 
                                icon={ShieldCheckIcon}
                                onClick={() => setActiveTab('security')}
                            >
                                Security
                            </Tab>
                        </nav>
                    </div>
                </div>

                {/* Account Settings Tab */}
                {activeTab === 'account' && (
                    <Card title="Account Information" description="Update your basic account details">
                        <form onSubmit={handleAccountSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={accountData.name}
                                    onChange={(e) => setAccountData('name', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <VerificationBadge 
                                        verified={verificationStep.email === 'verified'}
                                        onVerify={() => handleVerify('email')}
                                        onResend={handleResendCode}
                                    />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={accountData.email}
                                    onChange={(e) => setAccountData('email', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <VerificationBadge 
                                        verified={verificationStep.phone === 'verified'}
                                        onVerify={() => handleVerify('phone')}
                                        onResend={handleResendCode}
                                    />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={accountData.phone}
                                    onChange={(e) => setAccountData('phone', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-600 focus:ring-green-600"
                                    placeholder="07XXXXXXXX"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Notification Settings Tab */}
                {activeTab === 'notifications' && (
                    <Card title="Notification Preferences" description="Customize how and when you receive notifications">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <ToggleSwitch 
                                        enabled={notifications.enableAll} 
                                        setEnabled={(val) => setNotifications(prev => ({ ...prev, enableAll: val }))}
                                        label="Enable all notifications"
                                        description="Turn on/off all notification types at once"
                                    />
                                    
                                    <div className="space-y-4 pl-1 border-l-2 border-gray-100 ml-2">
                                        <CheckboxRow 
                                            id="newSupporter" 
                                            label="New supporter" 
                                            description="When someone supports you for the first time"
                                            checked={notifications.newSupporter} 
                                            onChange={handleCheckboxChange} 
                                        />
                                        <CheckboxRow 
                                            id="newComment" 
                                            label="New comment" 
                                            description="When a supporter leaves a comment on your page"
                                            checked={notifications.newComment} 
                                            onChange={handleCheckboxChange} 
                                        />
                                        <CheckboxRow 
                                            id="monthlySummary" 
                                            label="Monthly summary" 
                                            description="Receive a monthly report of your support activity"
                                            checked={notifications.monthlySummary} 
                                            onChange={handleCheckboxChange} 
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-200" />
                                
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700">Email Notification Frequency</h3>
                                    <p className="text-sm text-gray-500">Control how many email notifications you receive per day</p>
                                    
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <RadioPill 
                                            id="limit-unlimited" 
                                            name="emailLimit" 
                                            value="unlimited" 
                                            label="Unlimited" 
                                            checked={emailLimit === 'unlimited'} 
                                            onChange={(e) => setEmailLimit(e.target.value)}
                                            icon={EnvelopeIcon}
                                        />
                                        <RadioPill 
                                            id="limit-5" 
                                            name="emailLimit" 
                                            value="5" 
                                            label="5 per day" 
                                            checked={emailLimit === '5'} 
                                            onChange={(e) => setEmailLimit(e.target.value)}
                                            icon={EnvelopeIcon}
                                        />
                                        <RadioPill 
                                            id="limit-10" 
                                            name="emailLimit" 
                                            value="10" 
                                            label="10 per day" 
                                            checked={emailLimit === '10'} 
                                            onChange={(e) => setEmailLimit(e.target.value)}
                                            icon={EnvelopeIcon}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Reset defaults
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Security Settings Tab */}
                {activeTab === 'security' && (
                    <Card title="Security Settings" description="Manage your account security and privacy">
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800 mb-2">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                                    Enable 2FA
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800 mb-2">Login History</h4>
                                <p className="text-sm text-gray-600 mb-2">Recent account activity</p>
                                <div className="text-sm text-gray-600">
                                    <p>Last login: Today at 10:30 AM</p>
                                    <p>Device: Chrome on Windows</p>
                                    <p>Location: Kampala, Uganda</p>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                                <p className="text-sm text-red-600 mb-4">These actions are irreversible</p>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}