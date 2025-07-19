import React, { useState, useCallback, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import {
    GiftIcon,
    EllipsisHorizontalIcon,
    Bars3Icon,
    VideoCameraIcon,
    QuestionMarkCircleIcon,
    CheckBadgeIcon,
    LinkIcon,
    EnvelopeIcon,
    MapPinIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

// --- Reusable Components ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

const YouTubeEmbed = ({ url }) => {
    const getVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    
    const videoId = getVideoId(url);
    
    if (!videoId) {
        console.error('Invalid YouTube URL provided:', url);
        return <p className="text-red-500">Invalid YouTube URL</p>;
    }
    
    return (
        <div className="aspect-w-16 aspect-h-9">
            <iframe 
                className="w-full h-full rounded-lg shadow-md" 
                src={`https://www.youtube.com/embed/${videoId}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                loading="lazy"
            ></iframe>
        </div>
    );
};

const SocialLink = ({ href, icon: Icon, label }) => {
    if (!href) return null;
    
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-600 hover:text-[#10B981] transition-colors"
            aria-label={`Visit ${label}`}
        >
            <Icon className="h-5 w-5 mr-2" />
            <span>{label}</span>
        </a>
    );
};

const SupporterBadge = ({ supporter }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div 
            className="h-10 w-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold"
            aria-label={`Initial of ${supporter.name}`}
        >
            {supporter.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{supporter.name}</p>
            <p className="text-sm text-gray-500 truncate">{supporter.message || 'Supported this page'}</p>
        </div>
        <div className="text-sm font-semibold text-[#10B981]">
            £{supporter.amount}
        </div>
    </div>
);

const ProgressBar = ({ current, goal }) => {
    const percentage = Math.min(Math.round((current / goal) * 100), 100);
    
    return (
        <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
                <span>£{current} raised</span>
                <span>£{goal} monthly goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-[#10B981] h-2.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <p className="text-right text-sm text-gray-500 mt-1">{percentage}% of goal</p>
        </div>
    );
};

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, redirectUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Complete Payment</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close payment modal"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="flex-1">
                    <iframe 
                        src={redirectUrl}
                        className="w-full h-full border-0"
                        title="Payment Gateway"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                </div>
            </div>
        </div>
    );
};

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-sm p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <XMarkIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900">Payment Error</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Sections ---
const AboutSection = ({ user }) => (
    <Card>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">About {user.page_title}</h2>
            {user.is_verified && (
                <span className="flex items-center text-sm text-blue-500">
                    <CheckBadgeIcon className="h-5 w-5 mr-1" />
                    Verified
                </span>
            )}
        </div>
        
        <p className="mt-2 text-gray-600">{user.page_subtitle}</p>
        
        <div className="my-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-900">
                {user.page_title}
            </h1>
            <div className="h-3 w-48 bg-[#10B981] mt-2"></div>
        </div>
        
        <div className="text-gray-700 leading-relaxed space-y-4 whitespace-pre-wrap">
            {user.bio}
        </div>
        
        {(user.location || user.email) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                    {user.location && (
                        <div className="flex items-center text-gray-600">
                            <MapPinIcon className="h-5 w-5 mr-2" />
                            <span>{user.location}</span>
                        </div>
                    )}
                    {user.email && (
                        <a href={`mailto:${user.email}`} className="flex items-center text-gray-600 hover:text-[#10B981]">
                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                            <span>{user.email}</span>
                        </a>
                    )}
                </div>
            </div>
        )}
        
        {user.social_links && (
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Connect</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SocialLink href={user.social_links.twitter} icon={LinkIcon} label="Twitter" />
                    <SocialLink href={user.social_links.instagram} icon={LinkIcon} label="Instagram" />
                    <SocialLink href={user.social_links.youtube} icon={LinkIcon} label="YouTube" />
                    <SocialLink href={user.social_links.website} icon={LinkIcon} label="Website" />
                </div>
            </div>
        )}
    </Card>
);

const VideosSection = ({ links }) => {
    if (!links || links.length === 0) return null;

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {links.map((link, index) => (
                    <YouTubeEmbed key={index} url={link} />
                ))}
            </div>
        </Card>
    );
};

const PostsSection = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Posts</h2>
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.url} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            <Link href={post.url} className="hover:text-[#10B981] transition-colors">
                                {post.title}
                            </Link>
                        </h3>
                        <p className="text-gray-500 text-sm mb-2">{post.published_at}</p>
                        <p className="text-gray-600">{post.excerpt}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const SupportersSection = ({ supporters, supporterCount }) => {
    if (!supporters || supporters.length === 0) return null;

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Recent Supporters <span className="text-gray-400 text-lg">({supporterCount} total)</span>
            </h2>
            <div className="space-y-3">
                {supporters.map((supporter, index) => (
                    <SupporterBadge key={index} supporter={supporter} />
                ))}
            </div>
        </Card>
    );
};

const DonationForm = ({ user, coffeePrice, currency, onPaymentSuccess, onPaymentError }) => {
    const [quantity, setQuantity] = useState(1);
    const [isMonthly, setIsMonthly] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        wallet_id: user.wallet_id,
        amount: coffeePrice,
        phone_number: '',
        name: '',
        description_something_nice: '',
        transaction_type: 'donation_sent'
    });

    const quantities = [1, 3, 5];

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        const newQuantity = Math.max(1, value);
        setQuantity(newQuantity);
        setFormData(prev => ({
            ...prev,
            amount: newQuantity * coffeePrice
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Update amount based on current quantity
        const finalData = {
            ...formData,
            amount: quantity * coffeePrice,
        };

        console.log("Submitting donation with data:", finalData);
        
        setProcessing(true);
        setErrors({});

        try {
            const response = await Inertia.post(route('making-donation'), finalData, {
                onSuccess: (page) => {
                    console.log("Payment success response:", page.props);
                    
                    if (page.props.success) {
                        if (page.props.redirect_url) {
                            console.log("Redirecting to payment gateway:", page.props.redirect_url);
                            onPaymentSuccess(page.props.redirect_url);
                        } else {
                            console.error("Success but no redirect URL:", page.props);
                            onPaymentError('Payment initialized but no redirect URL received');
                        }
                    } else {
                        console.error("Payment service error:", page.props.message);
                        onPaymentError(page.props.message || 'Payment service error');
                    }
                },
                onError: (errors) => {
                    console.error("Form validation errors:", errors);
                    setErrors(errors);
                    const errorMessage = Object.values(errors)[0] || 'Payment failed. Please try again.';
                    onPaymentError(errorMessage);
                },
            });

            console.log("Inertia response:", response);
        } catch (error) {
            console.error("An unexpected error occurred during payment:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
            onPaymentError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6 lg:sticky lg:top-24">
            {user.goal_amount && (
                <div className="mb-4">
                    <ProgressBar current={user.current_month_amount || 0} goal={user.goal_amount} />
                </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                Buy {user.page_title} a coffee
                <QuestionMarkCircleIcon className="h-5 w-5 ml-2 text-gray-400" />
            </h2>

            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                <span className="text-lg pl-2">🎁</span>
                <span className="text-gray-500">x</span>
                <div className="flex-grow flex justify-around items-center">
                    {quantities.map((q) => (
                        <button 
                            type="button" 
                            key={q} 
                            onClick={() => {
                                setQuantity(q);
                                setFormData(prev => ({
                                    ...prev,
                                    amount: q * coffeePrice
                                }));
                            }} 
                            className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                quantity === q 
                                    ? 'bg-[#10B981] text-white scale-110 shadow-lg' 
                                    : 'bg-white hover:bg-gray-200 text-gray-700'
                            }`}
                            aria-label={`Select ${q} coffee${q > 1 ? 's' : ''}`}
                        >
                            {q}
                        </button>
                    ))}
                </div>
                <div className="relative ml-2">
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-md text-center focus:ring-[#10B981] focus:border-[#10B981]"
                        aria-label="Quantity"
                    />
                </div>
            </div>

            <div>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    placeholder="Name or @yoursocial" 
                    className={`w-full px-4 py-3 bg-gray-100 border-gray-200 rounded-lg focus:ring-[#10B981] focus:border-[#10B981] ${
                        errors.name ? 'border-red-500' : ''
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
                <input 
                    type="tel" 
                    value={formData.phone_number} 
                    onChange={(e) => handleInputChange('phone_number', e.target.value)} 
                    placeholder="Phone Number (e.g., 256712345678)" 
                    className={`w-full px-4 py-3 bg-gray-100 border-gray-200 rounded-lg focus:ring-[#10B981] focus:border-[#10B981] ${
                        errors.phone_number ? 'border-red-500' : ''
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.phone_number}
                />
                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
            </div>

            <div className="relative">
                <textarea 
                    value={formData.description_something_nice} 
                    onChange={(e) => handleInputChange('description_something_nice', e.target.value)} 
                    placeholder="Say something nice..." 
                    rows={4} 
                    className={`w-full px-4 py-3 bg-gray-100 border-gray-200 rounded-lg focus:ring-[#10B981] focus:border-[#10B981] resize-none ${
                        errors.description_something_nice ? 'border-red-500' : ''
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.description_something_nice}
                ></textarea>
                <button 
                    type="button" 
                    className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600"
                    aria-label="Attach video"
                >
                    <VideoCameraIcon className="h-5 w-5" />
                </button>
                {errors.description_something_nice && (
                    <p className="text-red-500 text-sm mt-1">{errors.description_something_nice}</p>
                )}
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isMonthly} 
                    onChange={(e) => setIsMonthly(e.target.checked)} 
                    className="h-5 w-5 rounded text-[#10B981] focus:ring-[#10B981] border-gray-300" 
                />
                <span className="text-gray-700">Make this monthly</span>
                <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" />
            </label>

            <button 
                type="submit" 
                disabled={processing}
                className={`w-full bg-[#10B981] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#059669] transition-all transform hover:scale-105 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-busy={processing}
            >
                {processing ? 'Processing...' : `Support ${currency || 'UGX'} ${(quantity * coffeePrice).toLocaleString()}`}
            </button>
        </form>
    );
};

// --- Main Page Component ---
export default function PublicView({ user, recent_supporters, currency }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const coffeePrice = user.coffee_price || 5;
    const themeColor = user.theme_color || '#10B981';

    const handlePaymentSuccess = useCallback((redirectUrl) => {
        console.log("Payment successful, redirecting to:", redirectUrl);
        setPaymentUrl(redirectUrl);
        setShowPaymentModal(true);
    }, []);

    const handlePaymentError = useCallback((error) => {
        console.error("Payment error occurred:", error);
        setErrorMessage(error);
        setShowErrorModal(true);
    }, []);

    const closePaymentModal = useCallback(() => {
        console.log("Closing payment modal");
        setShowPaymentModal(false);
        setPaymentUrl('');
    }, []);

    const closeErrorModal = useCallback(() => {
        console.log("Closing error modal");
        setShowErrorModal(false);
        setErrorMessage('');
    }, []);

    // Log initial props for debugging
    useEffect(() => {
        console.log("Component mounted with props:", {
            user,
            recent_supporters,
            currency
        });
    }, [user, recent_supporters, currency]);

    return (
        <>
            <Head title={`Support ${user.page_title}`} />
            
            <div className="min-h-screen bg-[#ECFDF5] font-sans text-gray-800">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="hidden md:flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div 
                                    className="flex-shrink-0 text-white font-bold p-2 text-xl rounded" 
                                    style={{ backgroundColor: themeColor }}
                                    aria-label="Support Platform Logo"
                                >
                                    SP
                                </div>
                                <h1 className="text-xl font-bold text-gray-800">{user.page_title}</h1>
                            </div>
                            <div className="flex items-center space-x-8">
                                {/* Navigation links can be added here */}
                            </div>
                            <div className="flex items-center space-x-4">
                               <button 
                                   className="text-gray-500 hover:text-gray-800"
                                   aria-label="More options"
                               >
                                   <EllipsisHorizontalIcon className="h-6 w-6" />
                               </button>
                               <a 
                                   href="#" 
                                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                   aria-label="Login"
                               >
                                   Login
                               </a>
                            </div>
                        </div>

                        <div className="flex md:hidden justify-between items-center h-16">
                             <a href="#" className="flex items-center space-x-2 text-gray-700">
                                <div className="bg-gray-800 text-white p-2 rounded-full">
                                    <GiftIcon className="h-5 w-5" />
                                </div>
                             </a>
                             <div className="flex items-center space-x-4">
                                <a href="#" className="text-sm font-medium text-gray-700">Login</a>
                                <button 
                                    className="text-gray-500 hover:text-gray-800"
                                    aria-label="Menu"
                                >
                                    <Bars3Icon className="h-6 w-6" />
                                </button>
                             </div>
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Mobile: Donation form first */}
                    <div className="block md:hidden mb-8">
                        <DonationForm 
                            user={user} 
                            coffeePrice={coffeePrice} 
                            currency={currency} 
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Left Column (Content) */}
                        <div className="lg:col-span-2 space-y-8 order-2 md:order-1">
                            {/* Mobile-only Title */}
                            <div className="block md:hidden text-center">
                                <div className="inline-block bg-gray-200 p-4 rounded-lg shadow-sm">
                                    <div 
                                        style={{ backgroundColor: themeColor }} 
                                        className="text-white font-bold p-3 text-3xl rounded"
                                        aria-label="Profile Icon"
                                    >
                                        SP
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mt-4">{user.page_title}</h1>
                            </div>

                            <AboutSection user={user} />
                            <VideosSection links={user.youtube_links} />
                            <PostsSection posts={user.featured_posts} />
                            {user.show_supporters && (
                                <SupportersSection 
                                    supporters={recent_supporters} 
                                    supporterCount={user.supporter_count} 
                                />
                            )}
                        </div>

                        {/* Right Column (Donation Form) - hidden on mobile */}
                        <div className="lg:col-span-1 hidden md:block order-1 md:order-2">
                            <DonationForm 
                                user={user} 
                                coffeePrice={coffeePrice} 
                                currency={currency}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={closePaymentModal} 
                redirectUrl={paymentUrl} 
            />

            {/* Error Modal */}
            <ErrorModal 
                isOpen={showErrorModal} 
                onClose={closeErrorModal} 
                error={errorMessage} 
            />
        </>
    );
}