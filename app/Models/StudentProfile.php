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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
