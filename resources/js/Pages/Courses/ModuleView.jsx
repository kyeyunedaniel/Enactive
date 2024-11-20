import React, { useState,useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

const ModuleView = ({ courses, auth, flash, categories, failure, success, response_message, error_message }) => {
    
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
    const [failureMessage, setFailureMessage] = useState('');

    return (
        <>
            <Head title="Manage Courses" />
            <AuthenticatedLayout
                user={auth}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Modules</h2>}
            >
                <div className="container mx-auto p-6">
                    

                    

                    {/* Success Modal */}
                    {isSuccessModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>
                                <p>{successMessage}</p>
                                <div className="flex justify-end mt-6">
                                    <button
                                        // onClick={() => setIsSuccessModalOpen(false)}
                                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isFailureModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4 text-red-600">Error</h2>
                                <p>{failureMessage}</p>
                                <div className="flex justify-end mt-6">
                                    <button
                                        // onClick={() => setIsFailureModalOpen(false)}
                                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AuthenticatedLayout>
        </>
    );
};

export default ModuleView;
