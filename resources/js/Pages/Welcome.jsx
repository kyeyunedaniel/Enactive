import React from 'react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect } from 'react';

const Welcome = ({ laravelVersion, phpVersion,auth }) => {
    useEffect(()=>{
        console.log(JSON.stringify(auth)); 
    },[])
  return (
    <AuthenticatedLayout user={auth}>
      {/* Login and Register Section */}
      <section className="login-register-section text-center py-16 bg-gray-200 rounded-lg">
        <h2 className="text-4xl font-bold mb-6">Continuing Education for Healthcare Providers</h2>
        <p className="text-lg text-gray-700 mb-6">
          Expand your knowledge with evidence-based training and certification.
        </p>
        <div className="space-x-4">
          <a href="#" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Sign In
          </a>
          <a href="#" className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400">
            Create an Account
          </a>
        </div>
      </section>

      {/* Featured Categories/Courses Section */}
      <section className="py-12">
        <h3 className="text-3xl font-bold text-center mb-8">Explore Our Courses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Category Card 1 */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-2">Cardiology Care</h4>
            <p className="text-gray-600 mb-4">
              Improve your expertise in heart care with up-to-date resources and certifications.
            </p>
            <a href="#" className="text-blue-500 hover:underline">Learn More</a>
          </div>

          {/* Category Card 2 */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-2">Stroke Care</h4>
            <p className="text-gray-600 mb-4">
              Master the latest stroke management techniques for faster recovery.
            </p>
            <a href="#" className="text-blue-500 hover:underline">Learn More</a>
          </div>

          {/* Category Card 3 */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-2">Emergency Medicine</h4>
            <p className="text-gray-600 mb-4">
              Stay ahead in emergency medicine with cutting-edge training.
            </p>
            <a href="#" className="text-blue-500 hover:underline">Learn More</a>
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-12 bg-blue-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Current With the Latest in Healthcare Education</h3>
          <p className="text-gray-700 mb-6">
            Access comprehensive learning tools, videos, and articles curated for healthcare professionals.
          </p>
          <a href="#" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Explore Resources
          </a>
        </div>
      </section>

      {/* Footer Section */}
      <div className="flex justify-center mt-16 px-6 sm:items-center sm:justify-between">
        <div className="text-center text-sm sm:text-start">&nbsp;</div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-end sm:ms-0">
          Laravel v{laravelVersion} (PHP v{phpVersion})
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Welcome;
