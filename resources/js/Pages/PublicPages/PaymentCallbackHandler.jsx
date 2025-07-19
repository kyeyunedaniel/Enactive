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

  // Auto-refresh for pending status
  useEffect(() => {
    if (localStatus === 'pending') {
      const interval = setInterval(() => {
        setIsLoading(true);
        window.location.reload();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [localStatus]);

  const statusConfig = {
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
      icon: <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />,
      title: 'Payment Failed',
      message: 'Payment processing failed',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
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

          {isLoading && localStatus === 'pending' && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Checking status again...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col space-y-3">
          {localStatus === 'completed' ? (
            <Link
              href={route('dashboard')}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-center"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Check Status Again'}
            </button>
          )}

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
        </div>
      </div>
    </div>
  );
}