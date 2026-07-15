<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@library.com',
            'password' => bcrypt('adminpass123'),
            'role' => 'admin',
        ]);

        // Student
        $student = User::create([
            'name' => 'Student User',
            'student_id' => 'STU-2026-001',
            'email' => 'student@library.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);

        \App\Models\StudentProfile::create([
            'user_id' => $student->id,
            'course' => 'BS Computer Science',
            'year_level' => '3rd Year',
        ]);

        // Settings
        \App\Models\Setting::insert([
            ['key' => 'late_penalty_per_day', 'value' => '10'],
            ['key' => 'damaged_book_penalty', 'value' => '200'],
            ['key' => 'lost_book_penalty', 'value' => '200'],
            ['key' => 'max_borrow_days', 'value' => '7'],
            ['key' => 'max_borrowed_books', 'value' => '3'],
            ['key' => 'school_name', 'value' => 'Global Tech University'],
            ['key' => 'academic_year', 'value' => '2026-2027'],
        ]);
    }
}
