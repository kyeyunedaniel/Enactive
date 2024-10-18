import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

// Function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const TakeQuiz = ({ quiz }) => {
    const { post, data, setData } = useForm({
        answers: {}, // Initialize answers object to hold answer IDs
    });

    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    useEffect(() => {
        const randomizedQuestions = quiz.questions.map(question => ({
            ...question,
            answers: shuffleArray([...question.answers]),
        }));
        setShuffledQuestions(shuffleArray(randomizedQuestions));
    }, [quiz]);

    const handleSubmit = (e) => {
        e.preventDefault();

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

    return (
        <div className="quiz-container">
            <h1 className="quiz-title">{quiz.title}</h1>
            <form onSubmit={handleSubmit}>
                {Array.isArray(shuffledQuestions) && shuffledQuestions.map((question) => (
                    <div key={question.id} className="question-block">
                        <h3 className="question-text">{question.question_text}</h3>
                        {Array.isArray(question.answers) && question.answers.map((answer) => (
                            <div key={answer.id} className="option">
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={answer.id}
                                        onChange={() => handleAnswerChange(question.id, answer.id)}
                                        checked={data.answers[question.id] === answer.id}
                                    />
                                    {answer.answer_text}
                                </label>
                            </div>
                        ))}
                    </div>
                ))}
                <button type="submit" className="submit-button">Submit Answers</button>
            </form>
        </div>
    );
};

export default TakeQuiz;
