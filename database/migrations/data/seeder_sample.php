<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Populate categories
        DB::table('categories')->insert([
            ['category_name' => 'Technology', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Business', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Arts', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Health', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Science', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // 2. Populate roles
        DB::table('roles')->insert([
            ['name' => 'Admin', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'User', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // 3. Populate users
        DB::table('users')->insert([
            [
                'name' => 'Alice Johnson', 'role_id' => 1, 'email' => 'alice@example.com', 
                'profile_picture' => 'path/to/pic1.jpg', 'bio' => 'AI enthusiast', 'phone_number' => '123456789', 
                'email_verified_at' => Carbon::now(), 'password' => bcrypt('password123'), 
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'name' => 'Bob Smith', 'role_id' => 2, 'email' => 'bob@example.com', 
                'profile_picture' => 'path/to/pic2.jpg', 'bio' => 'Business strategist', 'phone_number' => '987654321', 
                'email_verified_at' => Carbon::now(), 'password' => bcrypt('password123'), 
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            // Add more users as needed
        ]);

        // 4. Populate courses
        DB::table('courses')->insert([
            [
                'title' => 'Intro to AI', 'description' => 'An introductory course on AI', 
                'image_url' => 'img1.jpg', 'video_url' => 'vid1.mp4', 'course_price' => 100, 
                'created_by' => 1, 'category_id' => 1, 'course_description' => 'Detailed course on AI concepts.', 
                'course_objectives' => 'Understand basic AI principles.', 'intended_for' => 'Beginners', 
                'expected_outcomes' => 'Learn the foundations of AI.', 'certificate' => true, 
                'course_time' => '10 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'title' => 'Business Management', 'description' => 'Basics of managing a business', 
                'image_url' => 'img2.jpg', 'video_url' => 'vid2.mp4', 'course_price' => 120, 
                'created_by' => 2, 'category_id' => 2, 'course_description' => 'Learn fundamental management skills.', 
                'course_objectives' => 'Learn how to manage a team.', 'intended_for' => 'Aspiring managers', 
                'expected_outcomes' => 'Gain management skills.', 'certificate' => true, 
                'course_time' => '8 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            // Add more courses as needed
        ]);

        // 5. Populate modules
        DB::table('modules')->insert([
            ['course_id' => 1, 'title' => 'AI Foundations', 'description' => 'Introduction to AI concepts', 'order' => 1, 'module_time' => '2 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 1, 'title' => 'Machine Learning Basics', 'description' => 'Learn the basics of ML', 'order' => 2, 'module_time' => '3 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 2, 'title' => 'Business Fundamentals', 'description' => 'Understand the core of business', 'order' => 1, 'module_time' => '2 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more modules as needed
        ]);

        // 6. Populate quizzes
        DB::table('quizzes')->insert([
            ['course_id' => 1, 'title' => 'Module 1 Quiz', 'description' => 'Quiz for Module 1', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 1, 'is_final' => false],
            ['course_id' => 1, 'title' => 'Module 2 Quiz', 'description' => 'Quiz for Module 2', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 2, 'is_final' => false],
            ['course_id' => 1, 'title' => 'Final Exam', 'description' => 'Final exam for the course', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => null, 'is_final' => true],
            // Add more quizzes as needed
        ]);

        // 7. Populate questions
        DB::table('questions')->insert([
            ['quiz_id' => 1, 'question_text' => 'What is AI?', 'question_type' => 'multiple-choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 2, 'question_text' => 'Define Machine Learning.', 'question_type' => 'short-answer', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more questions as needed
        ]);

        // 8. Populate answers
        DB::table('answers')->insert([
            ['question_id' => 1, 'answer_text' => 'Artificial Intelligence', 'is_correct' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 1, 'answer_text' => 'Natural Intelligence', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more answers as needed
        ]);

        // 9. Populate user_progress
        DB::table('user_progress')->insert([
            ['user_id' => 1, 'course_id' => 1, 'last_module_id' => 1, 'progress_percentage' => 50, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 2, 'course_id' => 2, 'last_module_id' => 1, 'progress_percentage' => 20, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more user progress as needed
        ]);

        // 10. Populate quiz_attempts
        DB::table('quiz_attempts')->insert([
            ['user_id' => 1, 'quiz_id' => 1, 'score' => 80, 'completed_at' => Carbon::now(), 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 2, 'quiz_id' => 2, 'score' => 90, 'completed_at' => Carbon::now(), 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more quiz attempts as needed
        ]);

        // 11. Populate quiz_question_answers
        DB::table('quiz_question_answers')->insert([
            ['quiz_attempt_id' => 1, 'question_id' => 1, 'answer_id' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_attempt_id' => 2, 'question_id' => 2, 'answer_id' => 2, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more question answers as needed
        ]);
    }
}
