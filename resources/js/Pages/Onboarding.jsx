import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { 
    ArrowUpOnSquareIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components for this page ---

const Input = ({ id, type = 'text', value, onChange, placeholder, className = '' }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition ${className}`}
    />
);

const FuelIcon = ({ className = '' }) => (
    <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="currentColor"/>
    </svg>
);

const Textarea = ({ id, value, onChange, placeholder, rows = 4, className = '' }) => (
    <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition ${className}`}
    />
);

const Button = ({ children, onClick, disabled = false, type = 'button', className = '' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full sm:w-auto text-center font-bold py-3 px-8 rounded-full transition-colors duration-200 ${
            disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
        } ${className}`}
    >
        {children}
    </button>
);

export default function Onboarding({ auth }) {
    const [step, setStep] = useState(1);
    
    // Step 1 State: Profile
    const [profileData, setProfileData] = useState({
        name: '',
        about: '',
        socialLink: '',
        profilePhoto: null,
    });
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(auth.user.profile_photo_url || '');
    const fileInputRef = useRef();

    // Step 2 & 3 State: Payouts
    const [payoutData, setPayoutData] = useState({
        country: 'UG', // Default to Uganda
        phoneNumber: auth.user.phone || '',
        registeredName: auth.user.name || '',
        verificationCode: ''
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Validation
    const isStep1Valid = profileData.name && profileData.about && profileData.socialLink;
    const isStep3Valid = payoutData.phoneNumber && payoutData.registeredName;
    const isVerificationValid = payoutData.verificationCode.length === 6;

    // Event Handlers
    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prev => ({ ...prev, [id]: value }));
    };

    const handlePayoutChange = (e) => {
        const { id, value } = e.target;
        setPayoutData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({ ...prev, profilePhoto: file }));
            setProfilePhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleVerify = (e) => {
        e.preventDefault();
        setIsVerifying(true);
    };

    const handleComplete = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // In a real app, submit data to backend
        setTimeout(() => {
            router.get(route('dashboard.home'));
        }, 1500);
    };
    
    const handleSkipPayouts = () => {
        router.get(route('dashboard.home'));
    }

    // Country List
    const countries = [
        { code: 'UG', name: 'Uganda' },
        { code: 'KE', name: 'Kenya (coming soon)', disabled: true },
        { code: 'TZ', name: 'Tanzania (coming soon)', disabled: true },
        { code: 'RW', name: 'Rwanda (coming soon)', disabled: true },
    ];

    // UI Components for each step
    const Step1_Profile = () => (
        <div className="w-full max-w-4xl">
            <h1 className="text-3xl font-bold text-center mb-8">Complete your page</h1>
            <div className="bg-white rounded-2xl shadow-md p-8 grid md:grid-cols-3 gap-8 items-start">
                {/* Left Side: Profile Photo */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full bg-gray-100 mb-4 border-4 border-gray-100 overflow-hidden">
                        {profilePhotoPreview ? (
                            <img
                                src={profilePhotoPreview}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ArrowUpOnSquareIcon className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />
                        Upload profile photo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                </div>
                {/* Right Side: Form Fields */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input 
                            id="name" 
                            value={profileData.name} 
                            onChange={handleProfileChange} 
                            placeholder="Your public name"
                        />
                    </div>
                    <div>
                        <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About</label>
                        <Textarea 
                            id="about" 
                            value={profileData.about} 
                            onChange={handleProfileChange} 
                            rows={5}
                            placeholder="Tell your supporters about yourself"
                        />
                    </div>
                    <div>
                        <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700 mb-1">Website or social link</label>
                        <Input 
                            id="socialLink" 
                            value={profileData.socialLink} 
                            onChange={handleProfileChange} 
                            placeholder="https://"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
    
    const Step2_Payouts = () => (
        <div className="w-full max-w-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Set up your payout method</h1>
            
            <div className="bg-white rounded-2xl shadow-md p-8 mt-8">
                <div className="relative">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                        id="country"
                        value={payoutData.country}
                        onChange={handlePayoutChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-transparent rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                    >
                        {countries.map(c => (
                            <option 
                                key={c.code} 
                                value={c.code} 
                                disabled={c.disabled}
                            >
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex items-start text-left text-sm bg-green-50 text-green-800 p-4 rounded-lg">
                    <SparklesIcon className="w-8 h-8 mr-3 flex-shrink-0" />
                    <div>
                        <span className="font-bold">Takes less than 3 mins:</span> you'll enter your bank or mobile money details so we can send you payments. And don't worry, we never store your personal or bank details.
                    </div>
                </div>
            </div>
        </div>
    );

    const Step3_MobileMoney = () => (
        <div className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-center mb-2">Mobile Money Details</h1>
            <p className="text-gray-600 text-center mb-8">Please enter details for your Uganda (MTN or Airtel) account.</p>

            <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
                {!isVerifying ? (
                    <>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <Input 
                                id="phoneNumber" 
                                value={payoutData.phoneNumber} 
                                onChange={handlePayoutChange} 
                                placeholder="e.g., 0772123456"
                                type="tel"
                            />
                        </div>
                        <div>
                            <label htmlFor="registeredName" className="block text-sm font-medium text-gray-700 mb-1">Registered Mobile Money Name</label>
                            <Input 
                                id="registeredName" 
                                value={payoutData.registeredName} 
                                onChange={handlePayoutChange} 
                                placeholder="e.g., John Doe"
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <p className="text-xs text-gray-500 mb-2">We sent a 6-digit code to {payoutData.phoneNumber}. Please enter it below.</p>
                        <Input 
                            id="verificationCode" 
                            value={payoutData.verificationCode} 
                            onChange={handlePayoutChange} 
                            placeholder="_ _ _ _ _ _"
                            maxLength="6"
                            type="text"
                            pattern="\d*"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    // Progress Bar Component
    const ProgressBar = () => {
        const totalSteps = 3;
        const progressClasses = (s) => (step >= s ? 'bg-green-500' : 'bg-gray-200');
        return (
            <div className="flex items-center gap-2 w-full max-w-xs mx-auto">
                {[...Array(totalSteps)].map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full w-full ${progressClasses(i + 1)} transition-colors`}></div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Setup your page" />
            <div className="bg-gray-50 min-h-screen flex flex-col font-sans text-gray-900 antialiased">
                {/* Header */}
                <header className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <Link href={route('dashboard')} className="flex items-center space-x-2 text-green-600">
                            <FuelIcon className="w-8 h-8" />
                            <span className="font-bold text-2xl">CreatorFuel</span>
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                            Logout
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
                    {step === 1 && <Step1_Profile />}
                    {step === 2 && <Step2_Payouts />}
                    {step === 3 && <Step3_MobileMoney />}
                </main>

                {/* Footer */}
                <footer className="w-full px-4 sm:px-6 py-6 bg-white border-t border-gray-200">
                    <div className="max-w-4xl mx-auto">
                        <ProgressBar />
                        <div className="flex items-center justify-end mt-6">
                            {step === 2 && (
                                <button 
                                    onClick={handleSkipPayouts} 
                                    className="font-semibold text-gray-600 hover:text-gray-900 mr-6"
                                >
                                    Skip this step
                                </button>
                            )}
                            {step === 3 && !isVerifying && (
                                <Button onClick={handleVerify} disabled={!isStep3Valid}>
                                    Verify
                                </Button>
                            )}
                            {step === 3 && isVerifying && (
                                <Button onClick={handleComplete} disabled={!isVerificationValid || isSubmitting}>
                                    {isSubmitting ? (
                                        <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        'Complete Setup'
                                    )}
                                </Button>
                            )}
                            {step < 3 && (
                                <Button 
                                    onClick={() => setStep(step + 1)} 
                                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && payoutData.country !== 'UG')}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}