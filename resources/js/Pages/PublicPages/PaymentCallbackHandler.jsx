import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  CheckBadgeIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export default function PaymentCallback({ 
  status = 'pending', 
  amount, 
  currency = 'UGX', 
  reference,
  tracking_id,
  message,
  timestamp
}) {
  const [localStatus, setLocalStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(5);

  // Auto-refresh for pending status with limited retries
  useEffect(() => {
    if (localStatus === 'pending' && checkCount < 2) {
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLoading(true);
            setCheckCount(prevCount => prevCount + 1);
            
            // Reload the page to check status
            window.location.reload();
            return 5; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else if (localStatus === 'pending' && checkCount >= 2) {
      // After 2 checks, mark as failed
      setLocalStatus('failed');
    }
  }, [localStatus, checkCount]);

  // Update check count from localStorage on component mount
  useEffect(() => {
    const savedCheckCount = localStorage.getItem(`payment_check_${tracking_id}`);
    if (savedCheckCount) {
      const count = parseInt(savedCheckCount, 10);
      setCheckCount(count);
      
      // If we've already checked 2 times and status is still pending, mark as failed
      if (count >= 2 && status === 'pending') {
        setLocalStatus('failed');
      }
    }
  }, [tracking_id, status]);

  // Save check count to localStorage whenever it changes
  useEffect(() => {
    if (tracking_id && checkCount > 0) {
      localStorage.setItem(`payment_check_${tracking_id}`, checkCount.toString());
    }
  }, [checkCount, tracking_id]);

  const statusConfig = {
    success: {
      icon: <CheckBadgeIcon className="h-12 w-12 text-green-500" />,
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    completed: {
      icon: <CheckBadgeIcon className="h-12 w-12 text-green-500" />,
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    pending: {
      icon: <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />,
      title: 'Payment Processing',
      message: 'Your payment is being processed',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    failed: {
      icon: <XMarkIcon className="h-12 w-12 text-red-500" />,
      title: 'Payment Failed',
      message: checkCount >= 2 ? 'Payment verification timed out' : 'Payment processing failed',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    error: {
      icon: <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />,
      title: 'Error',
      message: message || 'An error occurred',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  };

  const currentStatus = statusConfig[localStatus] || statusConfig.error;

  const handleManualCheck = () => {
    if (checkCount >= 2) {
      return; // Don't allow more checks
    }
    
    setIsLoading(true);
    setCheckCount(prevCount => prevCount + 1);
    window.location.reload();
  };

  // Clean up localStorage when payment is successful
  useEffect(() => {
    if ((localStatus === 'success' || localStatus === 'completed') && tracking_id) {
      localStorage.removeItem(`payment_check_${tracking_id}`);
    }
  }, [localStatus, tracking_id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head title={currentStatus.title} />
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        {/* Status Header */}
        <div className={`p-6 ${currentStatus.bgColor} text-center`}>
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white">
            {currentStatus.icon}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            {currentStatus.title}
          </h1>
          <p className={`mt-2 ${currentStatus.textColor}`}>
            {currentStatus.message}
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-4">
          {amount && (
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                {currency} {amount.toLocaleString()}
              </span>
            </div>
          )}

          {reference && (
            <div className="flex justify-between">
              <span className="text-gray-500">Reference:</span>
              <span className="font-medium">{reference}</span>
            </div>
          )}

          {tracking_id && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking ID:</span>
              <span className="font-medium">{tracking_id}</span>
            </div>
          )}

          {timestamp && (
            <div className="flex justify-between">
              <span className="text-gray-500">Time:</span>
              <span className="font-medium">
                {new Date(timestamp).toLocaleString()}
              </span>
            </div>
          )}

          {/* Status checking info */}
          {localStatus === 'pending' && checkCount < 2 && (
            <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
              {isLoading ? (
                <p className="text-sm text-blue-600">
                  Checking payment status...
                </p>
              ) : (
                <div>
                  <p className="text-sm text-blue-600">
                    Automatically checking in {timeRemaining} seconds...
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Check {checkCount + 1} of 2
                  </p>
                </div>
              )}
            </div>
          )}

          {localStatus === 'failed' && checkCount >= 2 && (
            <div className="text-center mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                Payment verification failed after 2 attempts. Please contact support if you believe this is an error.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col space-y-3">
          {(localStatus === 'success' || localStatus === 'completed') ? (
            <Link
              href={route('dashboard')}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-center"
            >
              Go to Dashboard
            </Link>
          ) : localStatus === 'pending' && checkCount < 2 ? (
            <button
              onClick={handleManualCheck}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Check Status Now'}
            </button>
          ) : null}

          {(localStatus === 'failed' || localStatus === 'error') && (
            <Link
              href={''
                // route('support')
            }
              className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 rounded-md text-center"
            >
              Contact Support
            </Link>
          )}

          {/* Back to home link for all failed states */}
          {(localStatus === 'failed' || localStatus === 'error') && (
            <Link
              href={route('dashboard')}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-center"
            >
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}