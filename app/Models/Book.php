<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'book_id',
        'title',
        'author_id',
        'publisher_id',
        'category_id',
        'description',
        'cover_image',
        'total_copies',
        'available_copies',
        'status',
        'year_of_book',
    ];

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function borrowRecords()
    {
        return $this->hasMany(BorrowRecord::class);
    }
}
