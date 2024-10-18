<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\QuizQuestionAnswer;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class QuizQuestionAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = QuizQuestionAnswer::class;
    public function definition(): array
    {
        return [
        'quiz_question_id' => QuizQuestion::factory(),
            'answer_text' => $this->faker->sentence(),
            'is_correct' => $this->faker->boolean(),
        ];
    }
}
