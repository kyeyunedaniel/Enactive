import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';

// Function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const TakeQuiz = ({ quiz, auth }) => {
    const { post, data, setData } = useForm({
        answers: {}, // Initialize answers object to hold answer IDs
    });

    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state to confirm submission

    useEffect(() => {
        const randomizedQuestions = quiz.questions.map((question) => ({
            ...question,
            answers: shuffleArray([...question.answers]),
        }));
        setShuffledQuestions(shuffleArray(randomizedQuestions));
    }, [quiz]);

    const handleSubmit = () => {
        const formattedAnswers = shuffledQuestions.reduce((acc, question) => {
            acc[question.id] = data.answers[question.id] || null; // Set to null if not answered
            return acc;
        }, {});

        post(route('quiz.submit', quiz.id), {
            data: { answers: formattedAnswers },
        });
    };

    const handleAnswerChange = (questionId, answerId) => {
        setData('answers', {
            ...data.answers,
            [questionId]: answerId,
        });
    };

    // Navigation to next and previous questions
    const goToNextQuestion = () => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const jumpToLastQuestion = () => {
        setCurrentQuestionIndex(shuffledQuestions.length - 1);
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    // Open modal to confirm submission
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Close modal without submitting
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Confirm submission
    const confirmSubmit = () => {
        handleSubmit();
        setIsModalOpen(false); // Close modal after submission
    };

    return (
        <>
            <Head title="Take Quiz" />
            <AuthenticatedLayout
                user={auth}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{quiz?.title}</h2>}
            >
                <div className="quiz-container p-6">
                    
                    {shuffledQuestions.length > 0 && (
                        <>
                            {/* Show Current Question */}
                            <div className="question-card bg-white shadow-md rounded-lg p-6">
                                <h3 className="question-text text-lg font-semibold mb-4">
                                    {shuffledQuestions[currentQuestionIndex].question_text}
                                </h3>

                                {/* Answer Options */}
                                {shuffledQuestions[currentQuestionIndex].answers.map((answer) => (
                                    <div key={answer.id} className="answer-option flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name={`question-${shuffledQuestions[currentQuestionIndex].id}`}
                                            value={answer.id}
                                            onChange={() =>
                                                handleAnswerChange(
                                                    shuffledQuestions[currentQuestionIndex].id,
                                                    answer.id
                                                )
                                            }
                                            checked={
                                                data.answers[shuffledQuestions[currentQuestionIndex].id] === answer.id
                                            }
                                            className="mr-2"
                                        />
                                        <label className="text-gray-700">{answer.answer_text}</label>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="navigation-buttons flex justify-between mt-6">
                                {/* Previous Button */}
                                {currentQuestionIndex > 0 && (
                                    <button
                                        onClick={goToPreviousQuestion}
                                        className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                                    >
                                        Previous
                                    </button>
                                )}

                                {/* Jump to Last Question Button */}
                                {currentQuestionIndex < shuffledQuestions.length - 1 && (
                                    <button
                                        onClick={jumpToLastQuestion}
                                        className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
                                    >
                                        Last Question
                                    </button>
                                )}

                                {/* Next Button or Submit on Last Question */}
                                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                                    <button
                                        onClick={goToNextQuestion}
                                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        onClick={openModal} // Open modal on submit
                                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                                    >
                                        Submit Answers
                                    </button>
                                )}
                            </div>

                            {/* Question Number Navigation below the question */}
                            <div className="question-navigation mt-6 flex justify-center space-x-2 overflow-x-auto p-2 border-t border-gray-300">
                                {shuffledQuestions.map((question, index) => {
                                    // Determine the button color based on the answer status
                                    const isCurrent = currentQuestionIndex === index;
                                    const isAnswered = data.answers[question.id];
                                    
                                    let buttonColor = 'bg-gray-400'; // Default color for unanswered
                                    if (isCurrent) {
                                        buttonColor = 'bg-blue-600'; // Blue for current question
                                    } else if (isAnswered) {
                                        buttonColor = 'bg-green-600'; // Green for answered questions
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => goToQuestion(index)}
                                            className={`w-10 h-10 rounded-full text-white font-bold ${buttonColor} hover:bg-blue-700`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
                            <p>Are you sure you want to submit your answers?</p>
                            <div className="flex justify-end mt-6 space-x-4">
                                <button
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                                >
                                    Yes, Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
};

export default TakeQuiz;
