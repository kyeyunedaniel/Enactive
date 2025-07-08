import React, { useEffect, useState, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import debounce from 'lodash.debounce';

// --- Icon Components (re-used from previous designs) ---
const FuelIcon = ({ className = '' }) => (
    <svg className={`w-7 h-7 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.2C14.89 3.47 13.5 3 12 3C7.58 3 4 6.58 4 11C4 13.39 5.03 15.54 6.64 16.99L4.22 19.41C3.83 19.8 4.14 20.42 4.69 20.42H10V22H14V20.42H19.31C19.86 20.42 20.17 19.8 19.78 19.41L17.36 16.99C18.97 15.54 20 13.39 20 11C20 8.5 18.53 6.27 16 4.2Z" fill="currentColor"/>
    </svg>
);

const StarIcon = ({ className = '' }) => (
  <svg className={`w-5 h-5 text-green-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const HeartIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const ShoppingBagIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

// --- New Validation Icons ---
const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// --- Reusable Component ---
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
        <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </div>
    </div>
);


// --- Main Register Component ---
export default function Register() {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState({
        loading: false,
        message: '',
        isAvailable: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        username: '', // Add username to the form data, 
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // Debounced function to check username availability
    const checkUsername = useCallback(
    debounce(async (name) => {
      if (name.length < 4) {
        setUsernameStatus({ 
          loading: false, 
          message: 'Must be at least 4 characters.', 
          isAvailable: false 
        });
        return;
      }

      if (name.length > 30) {
        setUsernameStatus({ 
          loading: false, 
          message: 'Must be 30 characters or less.', 
          isAvailable: false 
        });
        return;
      }

      setUsernameStatus({ loading: true, message: '', isAvailable: false });

      try {
        const response = await axios.post('/check_public_url_availability', { 
          username: name 
        });

        setUsernameStatus({
          loading: false,
          message: response.data.available ? 'Available!' : 'This username is taken.',
          isAvailable: response.data.available
        });
      } catch (error) {
        setUsernameStatus({
          loading: false,
            message: getFriendlyErrorMessage(error),
          isAvailable: false
        });
      }
    }, 500),
    []
  );

  const getFriendlyErrorMessage = (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 422: 
          return error.response.data?.message || 'Username is unavailable';
        case 409:
          return 'Username is unavailable';
        case 500:
          return 'Server error. Please try again later';
        default:
          return 'Could not check username availability';
      }
    } else if (error.request) {
      return 'Network error. Please check your connection';
    }
    return 'Error checking username';
  };
    useEffect(() => {
        if (username) {
            checkUsername(username);
        } else {
            setUsernameStatus({ loading: false, message: '', isAvailable: false });
        }
    }, [username, checkUsername]);

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (usernameStatus.isAvailable) {
            setData('username', username);
            setStep(2);
        }
    };

        const handleDetailsSubmit = (e) => {
            console.log("username",username+ " and. "+ data.username ) 
            e.preventDefault();
            post(route('register'), {
                ...data,
                username: username // add the username to the existing data
            });
        };
        
    // Determine the color and icon for username status
    const getStatusStyles = () => {
        if (usernameStatus.loading) {
            return { color: 'text-gray-500', icon: <LoadingSpinner className="h-5 w-5 text-gray-400" /> };
        }
        if (!usernameStatus.message) {
            return { color: '', icon: null };
        }
        if (usernameStatus.isAvailable) {
            return { color: 'text-green-600', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" /> };
        }
        return { color: 'text-red-600', icon: <XCircleIcon className="h-5 w-5 text-red-500" /> };
    };
    
    const { color: statusColor, icon: statusIcon } = getStatusStyles();

    return (
        <>
            <Head title="Sign up - CreatorFuel" />
            <div className="min-h-screen font-sans bg-white lg:grid lg:grid-cols-5">

                {/* Left Branding Panel */}
                <div className="hidden lg:flex flex-col justify-between col-span-2 bg-green-50 p-8 xl:p-12">
                     <div>
                        <Link href="/" className="flex items-center space-x-2 text-green-600">
                            <FuelIcon className="w-8 h-8" />
                            <span className="font-bold text-2xl">CreatorFuel</span>
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-800 mt-12">
                            A supporter is worth a thousand followers.
                        </h1>
                    </div>
                    
                    <div className="space-y-6">
                       <FeatureCard
                            icon={<HeartIcon className="h-6 w-6 text-green-600" />}
                            title="Memberships"
                            description="Build a reliable income stream with recurring support."
                        />
                         <FeatureCard
                            icon={<ShoppingBagIcon className="h-6 w-6 text-green-600" />}
                            title="Sell Anything"
                            description="Digital downloads, physical products, and more."
                        />
                    </div>

                    <div>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                        </div>
                        <p className="mt-4 text-gray-700 font-medium">
                           "The only platform I'll ever need. It's simple, powerful, and my fans love it."
                        </p>
                        <div className="flex items-center mt-3">
                            <img className="h-10 w-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1580894908361-967195033215?ixlib=rb-4.0.3&q=80&fm=jpg&crop=faces&fit=crop&h=100&w=100" alt="Creator testimonial"/>
                            <div className="ml-3 text-sm">
                                <p className="font-semibold text-gray-800">Kaleigh Cohen</p>
                                <p className="text-gray-600">Fitness Creator</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex flex-col justify-center items-center col-span-3 px-6 py-12 sm:px-12 lg:px-16">
                    <div className="w-full max-w-md">
                        <div className="text-right mb-8">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-medium text-green-600 hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                        <div className="lg:hidden text-center mb-8">
                            <Link href="/" className="inline-flex items-center space-x-2 text-green-600">
                                <FuelIcon className="w-8 h-8" />
                                <span className="font-bold text-2xl">CreatorFuel</span>
                            </Link>
                        </div>
                        
                        {step === 1 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 text-center">Create your page</h2>
                                <p className="mt-2 text-center text-gray-600">Choose a public username for your page.</p>
                                <form onSubmit={handleUsernameSubmit} className="mt-8 space-y-6">
                                    <div>
                                        <label htmlFor="username" className="sr-only">Username</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 text-xl">creatorfuel.com/</span>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                required
                                                autoFocus
                                                minLength="4"
                                                maxLength="30"
                                                className="block w-full pl-[170px] pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-lg"
                                                placeholder="yourname"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">{statusIcon}</div>
                                        </div>
                                        {usernameStatus.message && (
                                            <p className={`mt-2 text-sm ${statusColor}`}>
                                                {usernameStatus.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <button type="submit" disabled={!usernameStatus.isAvailable || usernameStatus.loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                                            Continue
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                             <div>
                                <h2 className="text-3xl font-bold text-gray-900 text-center">Almost there!</h2>
                                <p className="mt-2 text-center text-gray-600">
                                    Your page will be: <span className="font-semibold text-green-600">creatorfuel.com/{data.username}</span>
                                </p>
                                <form onSubmit={handleDetailsSubmit} className="mt-8 space-y-6">
                                     <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input id="name" name="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus autoComplete="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                                        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                        <input id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <input id="password" name="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required autoComplete="new-password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                        <input id="password_confirmation" name="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required autoComplete="new-password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                                        {errors.password_confirmation && <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                    <div>
                                        {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
                                    </div>
                                    <div>
                                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all transform hover:scale-105" disabled={processing}>
                                            {processing ? 'Creating account...' : "Start my page — it's free"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        <p className="mt-8 text-xs text-center text-gray-500">
                            By continuing, you agree to CreatorFuel's <Link href="/terms" className="underline hover:text-gray-800">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-gray-800">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}