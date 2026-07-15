<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penalty extends Model
{
    protected $fillable = [
        'borrow_record_id',
        'user_id',
        'amount',
        'reason',
        'remarks',
        'status',
    ];

    public function borrowRecord()
    {
        return $this->belongsTo(BorrowRecord::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
