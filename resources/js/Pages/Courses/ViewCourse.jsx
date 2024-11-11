import React, { useEffect, useState, useCallback, useContext } from "react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Inertia } from '@inertiajs/inertia';
import ModuleItem from './ModuleItem';
import { CartContext } from "@/Context/CartContext";

const StrokeWebinarPage = ({ auth, course }) => {
    const { addToCart } = useContext(CartContext);

    const [expandedModule, setExpandedModule] = useState(null);

    const toggleModule = useCallback((moduleId) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    }, [expandedModule]);

    const updateProgress = (lastModuleId, userId, courseId, progressPercentage) => {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('course_id', courseId);
        formData.append('last_module_id', lastModuleId);
        formData.append('progress_percentage', progressPercentage);

        Inertia.post(route('update-module-progress'), formData, {
            onSuccess: () => console.log('Data sent successfully'),
            onError: (error) => console.error('Error:', error),
            forceFormData: true,
        });
    };

    useEffect(() => {
        console.log(JSON.stringify(course));
        console.log((auth?.id));
    }, [course]);


    const handleAddToCart = (item) => {
        console.log(item);
        addToCart(item);
    };
    return (
        <AuthenticatedLayout user={auth}>
            <Head title="Webinar Page" />
            <div className="max-w-7xl mx-auto px-8 py-12 text-gray-800">
                <div className="banner bg-blue-500 text-white text-center p-12 rounded-lg shadow-lg mb-12">
                    <h1 className="text-5xl font-bold leading-tight">{course.title}</h1>
                    <p className="mt-3 text-2xl">{course.intended_for}</p>
                    <p className="mt-4 text-lg italic">Unlock the potential of AI in your career!</p>
                </div>

                <div className="course-overview mb-12 p-8 bg-white rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-4xl font-semibold mb-6">Course Overview</h2>
                    <p className="mb-6">{course.course_description}</p>
                    <p className="mb-4 font-semibold">What You'll Learn:</p>
                    <ul className="list-disc list-inside mb-6 space-y-2">
                        <li>Fundamentals of Artificial Intelligence and Machine Learning</li>
                        <li>Hands-on experience with AI tools and frameworks</li>
                        <li>Real-world applications of AI across industries</li>
                        <li>Collaborative projects to reinforce learning</li>
                    </ul>
                    <p className="font-semibold">Course Duration:</p>
                    <p className="text-gray-600">{course.course_time}</p>
                    <p>{course.title +" "+ course.course_price+" "+ course.id}</p>
                    <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Add Items to Cart</h2>
                <div className="space-y-2">
                        <button
                            onClick={() =>{
                                let item_sent = { 
                                    product_id: course.id, 
                                    name: course.title, 
                                    quantity: 1,
                                    price: course.course_price,
                                    image:""
                                }
                                 handleAddToCart(item_sent)
                                
                                }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add {course.title} - ${course.course_price}
                        </button>
                </div>
        </div>
                </div>

                <div className="p-8 mb-12 bg-white rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-4xl font-semibold mb-6">Modules</h2>
                    <ul className="space-y-6">
                        {course.modules?.map((module) => (
                            <ModuleItem 
                                key={module.id} 
                                module={module} 
                                isExpanded={expandedModule === module.id} 
                                toggleModule={toggleModule} 
                                updateProgress={updateProgress} 
                                auth={auth} 
                                courseId={course.id} 
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StrokeWebinarPage;
