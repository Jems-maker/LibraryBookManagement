<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Models\BorrowRecord;
use Illuminate\Console\Command;

class SyncBookCopies extends Command
{
    protected $signature = 'books:sync-copies';
    protected $description = 'Sync available_copies to match actual active borrow records';

    public function handle()
    {
        $books = Book::all();

        foreach ($books as $book) {
            $activeBorrows = BorrowRecord::where('book_id', $book->id)
                ->whereIn('status', ['Pending Claim', 'Borrowed', 'Overdue'])
                ->count();

            $correctAvailable = $book->total_copies - $activeBorrows;
            $oldAvailable = $book->available_copies;

            if ($oldAvailable !== $correctAvailable) {
                $book->update(['available_copies' => $correctAvailable]);
                $this->info("Book #{$book->id} \"{$book->title}\": {$oldAvailable} → {$correctAvailable}");
            }
        }

        $this->info('Sync complete.');
    }
}