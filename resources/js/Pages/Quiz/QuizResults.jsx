import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const QuizResults = ({ auth, score, quizTitle,percentage_score,total_questions,quiz_id }) => {
    return (
        <>
            <Head title="Quiz Results" />
            <AuthenticatedLayout 
            user={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Quiz Results</h2>}
            >
                <div className="results-container p-6">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight mb-4">{quizTitle} Results</h2>
                    <div className="score-card bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold">Your Score:</h3>
                        <p className="text-md font-bold text-blue-600">{score} out of {total_questions} questions</p> {/* Adjust out of based on total questions */}
                        <p className="text-md font-bold text-blue-600">{percentage_score}%</p> {/* Adjust out of based on total questions */}
                    </div>
                    <div className="mt-4">
                        <button 
                            // onClick={() => route('quiz.show', quiz_id)} 
                            // onClick={() => window.history.back()} 
                            
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
};

export default QuizResults;
