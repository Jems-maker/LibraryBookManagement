<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'course',
        'year_level',
        'gender',
    ];

    protected $appends = ['course_description'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCourseDescriptionAttribute()
    {
        if (!$this->course) return null;
        
        static $courses = null;
        if ($courses === null) {
            $courses = \App\Models\Course::all()->keyBy('name');
        }
        
        $courseModel = $courses->get($this->course);
        return $courseModel ? $courseModel->description : $this->course;
    }
}
