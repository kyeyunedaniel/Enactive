<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Quiz;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Quiz::class; 

    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'question_text' => $this->faker->sentence(),
            'question_type' => 'multiple_choice', // Or 'true_false', etc.
        ];
    }
}
