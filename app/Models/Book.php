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

    protected static function booted(): void
    {
        static::saving(function (Book $book) {
            // Ensure available_copies never exceeds total_copies
            if ($book->available_copies > $book->total_copies) {
                $book->available_copies = $book->total_copies;
            }
            // Ensure available_copies is never negative
            if ($book->available_copies < 0) {
                $book->available_copies = 0;
            }
            // Sync status based on available_copies
            $book->status = $book->available_copies > 0 ? 'Available' : 'Unavailable';
        });
    }

    /**
     * Sync status when decrementing available_copies (doesn't fire saving event).
     */
    public function decrement($column, $amount = 1, array $extra = [])
    {
        if ($column === 'available_copies') {
            $fresh = $this->fresh();
            $current = $fresh ? $fresh->available_copies : $this->available_copies;
            $newValue = max(0, $current - $amount);
            $this->newQuery()->where('id', $this->id)->update([
                'available_copies' => $newValue,
                'status' => $newValue > 0 ? 'Available' : 'Unavailable',
            ]);
            $this->available_copies = $newValue;
            $this->status = $newValue > 0 ? 'Available' : 'Unavailable';
            $this->syncOriginalAttribute('available_copies');
            $this->syncOriginalAttribute('status');
            return $this;
        }
        return parent::decrement($column, $amount, $extra);
    }

    /**
     * Sync status when incrementing available_copies (doesn't fire saving event).
     */
    public function increment($column, $amount = 1, array $extra = [])
    {
        if ($column === 'available_copies') {
            $fresh = $this->fresh();
            if ($fresh && $fresh->available_copies >= $fresh->total_copies) {
                return $this;
            }
            $current = $fresh ? $fresh->available_copies : $this->available_copies;
            $newValue = min($this->total_copies, $current + $amount);
            $this->newQuery()->where('id', $this->id)->update([
                'available_copies' => $newValue,
                'status' => $newValue > 0 ? 'Available' : 'Unavailable',
            ]);
            $this->available_copies = $newValue;
            $this->status = $newValue > 0 ? 'Available' : 'Unavailable';
            $this->syncOriginalAttribute('available_copies');
            $this->syncOriginalAttribute('status');
            return $this;
        }
        return parent::increment($column, $amount, $extra);
    }

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
