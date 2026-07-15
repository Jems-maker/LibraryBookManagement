<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRequest extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'borrow_duration_days',
        'borrow_duration_hours',
        'return_date',
        'quantity',
        'status',
    ];

    protected $casts = [
        'return_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function borrowRecord()
    {
        return $this->hasOne(BorrowRecord::class);
    }
}
