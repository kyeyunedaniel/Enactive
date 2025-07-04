// resources/js/Pages/Settings.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    QuestionMarkCircleIcon,
    CheckIcon,
} from '@heroicons/react/24/solid';

// --- Reusable Components for this page ---

// A generic container card (can be reused)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// Tab component for settings navigation
const Tab = ({ children, isActive }) => (
    <Link 
        href="#" 
        className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors duration-200 ${
            isActive 
                ? 'text-gray-800 border-gray-800'
                : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}
    >
        {children}
    </Link>
);

// Custom styled toggle switch
const ToggleSwitch = ({ enabled, setEnabled }) => (
    <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`${
        enabled ? 'bg-gray-800' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        role="switch"
        aria-checked={enabled}
    >
        <span
        aria-hidden="true"
        className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

// Custom styled checkbox row
const CheckboxRow = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center cursor-pointer">
        <input 
            id={id} 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            className="sr-only peer" 
        />
        <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-yellow-400 peer-checked:border-yellow-400 flex items-center justify-center transition-colors">
            {checked && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
        <span className="ml-3 text-sm text-gray-700">{label}</span>
    </label>
);

// Custom styled radio button pill
const RadioPill = ({ id, name, value, label, checked, onChange }) => (
    <label htmlFor={id}>
        <input 
            id={id}
            type="radio" 
            name={name} 
            value={value} 
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
        />
        <div className="flex items-center px-4 py-1.5 border rounded-full cursor-pointer transition-colors peer-checked:border-gray-800 peer-checked:font-semibold text-gray-600 peer-checked:text-gray-800 hover:border-gray-400">
             <span className={`w-3 h-3 mr-2 rounded-full border border-gray-400 flex items-center justify-center peer-checked:border-gray-800`}>
                {checked && <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>}
             </span>
             {label}
        </div>
    </label>
);


export default function Settings({ auth }) {
    // State to manage form inputs, initialized to match the screenshot
    const [notifications, setNotifications] = useState({
        enableAll: false,
        newSupporter: true,
        newComment: false,
    });
    const [emailLimit, setEmailLimit] = useState('unlimited');

    const handleCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setNotifications(prev => ({ ...prev, [id]: checked }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Settings
                </h1>
            }
        >
            <Head title="Settings" />
            
            {/* Floating Help Button */}
            <button className="fixed bottom-6 right-6 bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50">
                <QuestionMarkCircleIcon className="w-7 h-7" />
            </button>

            <div className="max-w-3xl mx-auto">
                {/* Settings Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <Tab isActive={false}>Settings</Tab>
                            <Tab isActive={true}>Notifications</Tab>
                        </nav>
                    </div>
                </div>

                {/* Main Settings Card */}
                <Card>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-8">
                            {/* General Notifications Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">General Notifications</h3>
                                    <div className="flex items-center">
                                        <span className="text-sm mr-3 text-gray-600">Enable all</span>
                                        <ToggleSwitch enabled={notifications.enableAll} setEnabled={(val) => setNotifications(prev => ({ ...prev, enableAll: val }))} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <CheckboxRow id="newSupporter" label="When I get a new supporter." checked={notifications.newSupporter} onChange={handleCheckboxChange} />
                                    <CheckboxRow id="newComment" label="When a supporter comments on my page." checked={notifications.newComment} onChange={handleCheckboxChange} />
                                </div>
                            </div>

                            <hr className="border-gray-200" />
                            
                            {/* Limit Email Notifications Section */}
                             <div className="space-y-4">
                                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Limit Email Notification</h3>
                                <div className="flex flex-wrap gap-3 text-sm">
                                    <RadioPill id="limit-unlimited" name="emailLimit" value="unlimited" label="Unlimited" checked={emailLimit === 'unlimited'} onChange={(e) => setEmailLimit(e.target.value)} />
                                    <RadioPill id="limit-5" name="emailLimit" value="5" label="5 per day" checked={emailLimit === '5'} onChange={(e) => setEmailLimit(e.target.value)} />
                                    <RadioPill id="limit-10" name="emailLimit" value="10" label="10 per day" checked={emailLimit === '10'} onChange={(e) => setEmailLimit(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-10">
                            <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 transition-colors text-gray-800 font-semibold py-3 rounded-lg">
                                Save changes
                            </button>
                        </div>
                    </form>
                </Card>

              
            </div>

        </AuthenticatedLayout>
    );
}