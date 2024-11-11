import React from 'react';
import { FaTv } from 'react-icons/fa';

const ModuleItem = ({ module, isExpanded, toggleModule, updateProgress, auth, courseId }) => {
    const renderProgressText = (progress) => {
        if (progress === 100) return `(Complete) ${progress}%`;
        if (progress !== undefined) return `(Incomplete) ${progress}%`;
        return '(No progress available)';
    };

    return (
        <li key={module.id} className="border-b pb-6">
            <div
                className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition duration-200"
                onClick={() => toggleModule(module.id)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <strong className="text-lg mr-2">{module.title}</strong>
                    <b className={module?.user_progress?.[0]?.progress_percentage === 100 ? 'text-green-600' : 'text-red-400'}>
                        {renderProgressText(module?.user_progress?.[0]?.progress_percentage)}
                    </b>
                </div>
                <span className="flex items-center text-blue-600 space-x-2 mt-2 sm:mt-0">
                    <span>Watch</span>
                    <FaTv />
                </span>
            </div>

            {isExpanded && (
                <div className="mt-4 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/2 text-gray-700 text-justify">
                        <p>{module.description}</p>
                        <p className="font-semibold mt-2">Duration: {module.module_time}</p>
                    </div>

                    {module.quizzes && module.quizzes.quiz_attempts?.length > 0 && (
                        <div className="w-full sm:w-1/2 mt-4 sm:mt-0 sm:ml-4">
                            <h3 className="font-semibold text-lg mb-4">Quiz Attempts</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {module.quizzes.quiz_attempts.map((attempt) => (
                                    <div key={attempt.id} className="bg-gray-200 p-4 rounded-md">
                                        <p className="font-semibold">Score: {attempt.score}%</p>
                                        <p className="text-sm text-gray-600">Completed at: {attempt.completed_at}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-200"
                    onClick={() => updateProgress(module.id, auth.id, courseId, 100)}
                >
                    Update Progress
                </button>
            </div>
        </li>
    );
};

export default ModuleItem;
