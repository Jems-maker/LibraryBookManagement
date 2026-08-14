<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRecord extends Model
{
    protected $fillable = [
        'borrow_id',
        'borrow_request_id',
        'user_id',
        'book_id',
        'borrow_date',
        'due_date',
        'return_date',
        'qr_code_path',
        'return_qr_path',
        'status',
        'due_reminder_sent_at',
        'overdue_reminder_sent_at',
    ];

    protected $casts = [
        'borrow_date' => 'datetime',
        'due_date' => 'datetime',
        'return_date' => 'datetime',
        'due_reminder_sent_at' => 'datetime',
        'overdue_reminder_sent_at' => 'datetime',
    ];

    public function borrowRequest()
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function penalties()
    {
        return $this->hasMany(Penalty::class);
    }
}
