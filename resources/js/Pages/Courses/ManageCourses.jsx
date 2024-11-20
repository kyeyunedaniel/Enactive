import React, { useState,useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

const ManageCourses = ({ courses, auth, flash, categories, failure, success, response_message, error_message }) => {
    useEffect(()=>{
        console.log(JSON.stringify(categories)); 
        // console.log("failue"+failure); 
        // console.log("success"+success);
        // console.log("extradata  "+kk);
        if (response_message) {
            console.log("Session Data", response_message);
            setSuccessMessage(response_message);
            setIsSuccessModalOpen(true);
            resetFields()

            // You can perform any actions with the 'kk' data here
        }
        if (error_message) {
            console.log("Session Data", error_message);
            setFailureMessage(error_message);
            setIsFailureModalOpen(true);            
            // You can perform any actions with the 'kk' data here
        }

    },[response_message,error_message])
    const { data, setData, post, delete: destroy, processing, errors } = useForm({
        title: '',
        description: '',
        course_background: '',
        course_price: '',
        image_url: null,
        video_url: null,
        category_id: '',
        course_objectives: '',
        intended_for: '',
        expected_outcomes: '',
        certificate: false,
        course_time: '',

    });

    const [editingCourseId, setEditingCourseId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
    const [failureMessage, setFailureMessage] = useState('');


    // Handle form submission for adding or updating a course
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(JSON.stringify(data)); 

        // return ''; 
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('course_price', data.course_price);
        formData.append('category_id', data.category_id);
        formData.append('course_background', data.course_background);
        formData.append('course_objectives', data.course_objectives);
        formData.append('intended_for', data.intended_for);
        formData.append('expected_outcomes', data.expected_outcomes);
        formData.append('certificate', data.certificate);
        formData.append('course_time', data.course_time);

        if (data.image_url) formData.append('image_url', data.image_url);
        if (data.video_url) formData.append('video_url', data.video_url);

        // Check if we are editing or adding a course
        console.log(JSON.stringify(editingCourseId)); 
        if (editingCourseId) {
            post(route('courses.update', editingCourseId), {
                data: formData,
                onSuccess: () => {
                    // resetFields();
                    // setSuccessMessage('Course updated successfully!');
                    // setIsSuccessModalOpen(true);
                },
                forceFormData: true,
            });
        } else {
            post(route('courses.store'), {
                data: formData,
                onSuccess: () => {
                    // resetFields();
                    // setSuccessMessage('Course added successfully!');
                    // setIsSuccessModalOpen(true);
                },
                forceFormData: true,
            });
        }
    };

    // Function to handle editing a course
    const handleEdit = (course) => {
        setData((prevData) => ({
            ...prevData,
            title: course.title,
            description: course.description,
            course_background: course.course_background,
            course_price: course.course_price,
            image_url: course.image_url, // Reset image for editing
            video_url: course.video_url, // Reset video for editing
            category_id: course.category_id,
            course_objectives: course.course_objectives,
            intended_for: course.intended_for,
            expected_outcomes: course.expected_outcomes,
            certificate: course.certificate,
            course_time: course.course_time,
        }));
        setEditingCourseId(course.id);
    };

    // Reset form fields
    const resetFields = () => {
        setData({ title: '', description: '', course_price: '', image_url: null, video_url: null,category_id:'',course_background:'',course_objectives:'',intended_for:'',expected_outcomes:'',course_time:'',certificate:false });
        setEditingCourseId(null);
    };

    // Function to handle opening the delete confirmation modal
    const handleOpenModal = (courseId) => {
        setCourseToDelete(courseId);
        setIsModalOpen(true);
    };

    // Function to confirm deletion of a course
    const handleDelete = () => {
        destroy(route('courses.destroy', courseToDelete), {
            onSuccess: () => setIsModalOpen(false),
        });
        setCourseToDelete(null);
    };

    // Close modal without deleting
    const closeModal = () => {
        setIsModalOpen(false);
        setCourseToDelete(null);
    };

    return (
        <>
            <Head title="Manage Courses" />
            <AuthenticatedLayout
                user={auth}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Courses</h2>}
            >
                <div className="container mx-auto p-6">
                    {/* Course Form */}
                    <form onSubmit={handleSubmit} className="mb-6 bg-white shadow-md rounded-lg p-6">
                        <div className="mb-4">
                            <label className="block text-gray-700">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                required
                            />
                            {errors.title && <div className="text-red-600">{errors.title}</div>}
                        </div>

                        {/* category */}
                        <div className="mb-4 flex items-center space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700">Category</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                            {/* Certificate */}
                        <div className="w-1/2">
                            <label className="block text-gray-700">Certificate</label>
                            <input
                                type="checkbox"
                                checked={data.certificate}
                                onChange={(e) => setData('certificate', e.target.checked)}
                                className="mr-2"
                            />
                            Issue Certificate
                        </div>
                        </div>


                        <div className="mb-4">
                            <label className="block text-gray-700">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                rows="3"
                            ></textarea>
                            {errors.description && <div className="text-red-600">{errors.description}</div>}
                        </div>

                        {['course_background','course_objectives', 'intended_for', 'expected_outcomes'].map((field) => (
                            <div key={field} className="mb-4">
                                <label className="block text-gray-700">
                                    {field.replace('_', ' ')}
                                </label>
                                <textarea
                                    value={data[field]}
                                    onChange={(e) => setData(field, e.target.value)}
                                    className="border rounded px-3 py-2 w-full"
                                    rows="3"
                                ></textarea>
                            </div>
                        ))}

                        {/* Course Time */}
                        <div className="mb-4 flex items-center space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700">Course Time (e.g., 10 hours)</label>
                            <input
                                type="text"
                                value={data.course_time}
                                onChange={(e) => setData('course_time', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                required
                            />
                        </div>


                        <div className="w-1/2">
                            <label className="block text-gray-700">Course Price 'UGX'</label>
                            <input
                                type="number"
                                value={data.course_price}
                                onChange={(e) => setData('course_price', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                                required
                            />
                        </div>
                        </div>


                        <div className="mb-4">
                            <label className="block text-gray-700">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('image_url', e.target.files[0])}
                                className="border rounded px-3 py-2 w-full"
                            />
                            {errors.image_url && <div className="text-red-600">{errors.image_url}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Video URL</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setData('video_url', e.target.files[0])}
                                className="border rounded px-3 py-2 w-full"
                            />
                            {errors.video_url && <div className="text-red-600">{errors.video_url}</div>}
                        </div>
                        {/* <div>{setData('image_url', e.target.files[0])}</div> */}
                        <button
                            type="submit"
                            className={`bg-blue-600 text-white px-4 py-2 rounded ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={processing}
                        >
                            {editingCourseId ? 'Update Course' : 'Add Course'}
                        </button>
                    </form>

                    {/* Course List */}
                    <table className="min-w-full border">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Title</th>
                                <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Course Price</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id}>
                                    <td className="border px-4 py-2">{course.id}</td>
                                    <td className="border px-4 py-2">{course.title}</td>
                                    <td className="border px-4 py-2">{course.description}</td>
                                    <td className="border px-4 py-2">{course.course_price}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(course.id)}
                                            className="bg-red-400 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Confirmation Modal for Deletion */}
                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                                <p>Are you sure you want to delete this course?</p>
                                <div className="flex justify-end mt-6 space-x-4">
                                    <button
                                        onClick={closeModal}
                                        className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Modal */}
                    {isSuccessModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>
                                <p>{successMessage}</p>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setIsSuccessModalOpen(false)}
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
                                        onClick={() => setIsFailureModalOpen(false)}
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

export default ManageCourses;
