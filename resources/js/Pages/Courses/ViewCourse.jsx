import React from "react";
import { Link, Head } from "@inertiajs/react";
import PageHeaderUnauthenticated from "../PageHeaderUnauthenticated";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const StrokeWebinarPage = ({ auth }) => {
    const PageContent = (
        <div className="max-w-6xl mx-auto px-6 py-10 text-gray-800">
            {/* Banner Section */}
            <div className="banner bg-blue-700 text-white text-center p-8 rounded-lg shadow-lg mb-10">
                <h1 className="text-4xl font-bold leading-tight">2020 AHA Western States Summer Stroke Webinar Series</h1>
                <p className="mt-3 text-xl">Hemorrhagic Stroke</p>
            </div>

            {/* Course Info Section */}
            <div className="course-info mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4">Course Details</h2>
                <p className="mb-4">
                    Join us for a series of webinars designed to provide healthcare professionals with the latest
                    updates in stroke care. This particular webinar focuses on hemorrhagic stroke, covering recent
                    advances, patient outcomes, and case studies.
                </p>
                <p className="font-semibold mb-2">Audience:</p>
                <p className="text-gray-600">Healthcare professionals, stroke specialists, and medical students.</p>
            </div>

            {/* Additional Course Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-3xl font-semibold mb-4">Additional Information</h2>
                    <div className="space-y-4">
                        <p><strong>Instruction Type:</strong> Webinar</p>
                        <p><strong>Product Number:</strong> 28-1004</p>
                        <p><strong>Course Duration:</strong> 1 Hour</p>
                    </div>
                </div>

                {/* Course Content Section */}
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-3xl font-semibold mb-4">Course Content & Topics</h2>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Overview of Hemorrhagic Stroke</li>
                        <li>Recent Advances in Stroke Treatment</li>
                        <li>Case Studies Analysis</li>
                        <li>Patient Outcomes and Management Strategies</li>
                    </ul>
                </div>
            </div>

            {/* Overview Section */}
            <div className="overview mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4">Overview</h2>
                <p className="mb-4">
                    This summer series is part of the American Heart Association's educational initiatives to
                    provide top-notch, up-to-date medical education. Topics include in-depth looks at clinical
                    trials, treatment options, and guidelines for managing hemorrhagic stroke.
                </p>
            </div>

            {/* Learning Objectives Section */}
            <div className="learning-objectives mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4">Learning Objectives</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Understand current treatment options for hemorrhagic stroke.</li>
                    <li>Analyze case studies to improve patient outcomes.</li>
                    <li>Identify potential complications and management strategies.</li>
                </ul>
            </div>

            {/* Registration Section */}
            <div className="registration-info mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4">Registration Information</h2>
                <p className="mb-4">The series is open for free registration to all healthcare providers.</p>
                <Link href="/register">
                    <button className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                        Register Now
                    </button>
                </Link>
            </div>

            {/* Additional Resources Section */}
            <div className="additional-resources mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4">Additional Resources</h2>
                <p>
                    Access downloadable resources, including slides and case study summaries, after completing the
                    webinar series.
                </p>
            </div>
        </div>
    );

    return (
        <>
            <Head title="View Course" />
            <AuthenticatedLayout user={auth}>
                {PageContent} {/* Show content regardless of authentication */}
            </AuthenticatedLayout>
        </>
    );
};

export default StrokeWebinarPage;
