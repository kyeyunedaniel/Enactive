<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AllDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Existing data insertion for categories
        DB::table('categories')->insert([
            ['category_name' => 'Technology', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Business', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Arts', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Health', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['category_name' => 'Science', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // Existing data insertion for users
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

        // Existing data insertion for courses
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
            // New courses added
            [
                'title' => 'Web Development Basics', 'description' => 'Learn the foundations of web development', 
                'image_url' => 'img3.jpg', 'video_url' => 'vid3.mp4', 'course_price' => 150, 
                'created_by' => 1, 'category_id' => 1, 'course_description' => 'A comprehensive guide to web development.', 
                'course_objectives' => 'Build responsive websites.', 'intended_for' => 'Aspiring web developers', 
                'expected_outcomes' => 'Create your first website.', 'certificate' => true, 
                'course_time' => '12 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'title' => 'Digital Marketing Strategies', 'description' => 'Master digital marketing techniques', 
                'image_url' => 'img4.jpg', 'video_url' => 'vid4.mp4', 'course_price' => 130, 
                'created_by' => 2, 'category_id' => 2, 'course_description' => 'Learn how to market products online effectively.', 
                'course_objectives' => 'Understand digital marketing tools.', 'intended_for' => 'Marketing professionals', 
                'expected_outcomes' => 'Implement marketing strategies.', 'certificate' => true, 
                'course_time' => '10 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
        ]);

        // Existing data insertion for modules
        DB::table('modules')->insert([
            ['course_id' => 1, 'title' => 'AI Foundations', 'description' => 'Introduction to AI concepts', 'order' => 1, 'module_time' => '2 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 1, 'title' => 'Machine Learning Basics', 'description' => 'Learn the basics of ML', 'order' => 2, 'module_time' => '3 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 2, 'title' => 'Business Fundamentals', 'description' => 'Understand the core of business', 'order' => 1, 'module_time' => '2 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // New modules for the additional courses
            ['course_id' => 3, 'title' => 'HTML & CSS Basics', 'description' => 'Learn the basics of HTML and CSS', 'order' => 1, 'module_time' => '4 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 3, 'title' => 'JavaScript Essentials', 'description' => 'Introduction to JavaScript', 'order' => 2, 'module_time' => '5 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 4, 'title' => 'SEO Techniques', 'description' => 'Learn SEO best practices', 'order' => 1, 'module_time' => '3 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['course_id' => 4, 'title' => 'Social Media Marketing', 'description' => 'Harness the power of social media', 'order' => 2, 'module_time' => '4 hours', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // Existing data insertion for quizzes
        DB::table('quizzes')->insert([
            ['course_id' => 1, 'title' => 'Module 1 Quiz', 'description' => 'Quiz for Module 1', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 1, 'is_final' => false],
            ['course_id' => 1, 'title' => 'Module 2 Quiz', 'description' => 'Quiz for Module 2', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 2, 'is_final' => false],
            ['course_id' => 1, 'title' => 'Final Exam', 'description' => 'Final exam for the course', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => null, 'is_final' => true],
            // New quizzes for the additional courses
            ['course_id' => 3, 'title' => 'HTML & CSS Quiz', 'description' => 'Quiz for HTML & CSS module', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 1, 'is_final' => false],
            ['course_id' => 3, 'title' => 'JavaScript Quiz', 'description' => 'Quiz for JavaScript module', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 2, 'is_final' => false],
            ['course_id' => 4, 'title' => 'Digital Marketing Quiz', 'description' => 'Quiz for Digital Marketing module', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 1, 'is_final' => false],
            ['course_id' => 4, 'title' => 'Social Media Quiz', 'description' => 'Quiz for Social Media module', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => 2, 'is_final' => false],
            ['course_id' => 4, 'title' => 'Final Marketing Exam', 'description' => 'Final exam for Digital Marketing course', 'is_active' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now(), 'module_id' => null, 'is_final' => true],
        ]);

        // Existing data insertion for questions
        DB::table('questions')->insert([
            ['quiz_id' => 1, 'question_text' => 'What is AI?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 1, 'question_text' => 'What are the types of AI?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 2, 'question_text' => 'Define machine learning.', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // New questions for additional quizzes
            ['quiz_id' => 3, 'question_text' => 'Which HTML tag is used for the largest heading?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 3, 'question_text' => 'What does CSS stand for?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 4, 'question_text' => 'What is the main purpose of SEO?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 4, 'question_text' => 'What is a backlink?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 5, 'question_text' => 'What is the purpose of social media marketing?', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['quiz_id' => 5, 'question_text' => 'Name a popular social media platform.', 'question_type' => 'multiple_choice', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // Existing data insertion for answers
        DB::table('answers')->insert([
            ['question_id' => 1, 'answer_text' => 'Artificial Intelligence', 'is_correct' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 1, 'answer_text' => 'Machine Learning', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 1, 'answer_text' => 'Deep Learning', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 1, 'answer_text' => 'None of the above', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // New answers for the additional questions
            ['question_id' => 3, 'answer_text' => 'Teaching machines to learn from data', 'is_correct' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 3, 'answer_text' => 'Pre-programmed responses', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 4, 'answer_text' => 'To improve website ranking', 'is_correct' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 4, 'answer_text' => 'To create web content', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 5, 'answer_text' => 'To increase visibility and engagement', 'is_correct' => true, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['question_id' => 5, 'answer_text' => 'To decrease followers', 'is_correct' => false, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);
    }
}
