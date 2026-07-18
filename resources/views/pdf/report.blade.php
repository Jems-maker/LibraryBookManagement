<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Library Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            font-size: 18px;
            margin: 0 0 5px;
        }
        .header p {
            font-size: 11px;
            color: #666;
            margin: 0;
        }
        .filters {
            margin-bottom: 15px;
            font-size: 10px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #f3f4f6;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 6px;
            text-align: left;
            border: 1px solid #d1d5db;
        }
        td {
            padding: 6px;
            border: 1px solid #d1d5db;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .summary {
            margin-bottom: 20px;
        }
        .summary table {
            width: auto;
        }
        .summary td {
            padding: 4px 12px;
            border: none;
            font-size: 10px;
        }
        .summary .label {
            font-weight: bold;
            color: #555;
        }
        .footer {
            text-align: center;
            font-size: 8px;
            color: #999;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-overdue { background: #fee2e2; color: #dc2626; }
        .badge-active { background: #dbeafe; color: #2563eb; }
        .badge-returned { background: #d1fae5; color: #059669; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Library Management System - Borrow Report</h1>
        <p>{{ $from }} — {{ $to }}</p>
    </div>

    <div class="filters">
        @if($categoryId)
            <strong>Category:</strong> {{ optional(\App\Models\Category::find($categoryId))->name ?? 'All' }}
        @else
            <strong>Category:</strong> All
        @endif
        &nbsp;|&nbsp; <strong>Total Records:</strong> {{ $records->count() }}
    </div>

    @if($records->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Borrow ID</th>
                    <th>Student</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>Category</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($records as $i => $record)
                    <tr>
                        <td class="text-center">{{ $i + 1 }}</td>
                        <td style="font-family: monospace;">{{ $record->borrow_id }}</td>
                        <td>{{ $record->user->name ?? 'N/A' }}</td>
                        <td>{{ $record->book->title ?? 'N/A' }}</td>
                        <td>{{ $record->book->author->name ?? '—' }}</td>
                        <td>{{ $record->book->publisher->name ?? '—' }}</td>
                        <td>{{ $record->book->category->name ?? '—' }}</td>
                        <td>{{ $record->borrow_date ? \Carbon\Carbon::parse($record->borrow_date)->format('M d, Y') : '—' }}</td>
                        <td>{{ $record->due_date ? \Carbon\Carbon::parse($record->due_date)->format('M d, Y') : '—' }}</td>
                        <td>{{ $record->return_date ? \Carbon\Carbon::parse($record->return_date)->format('M d, Y') : '—' }}</td>
                        <td>
                            @if($record->status === 'Overdue')
                                <span class="badge badge-overdue">Overdue</span>
                            @elseif($record->return_date)
                                <span class="badge badge-returned">Returned</span>
                            @else
                                <span class="badge badge-active">Active</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="text-align: center; color: #999; margin-top: 40px;">No records found for the selected period.</p>
    @endif

    <div class="footer">
        Generated on {{ now()->format('F d, Y \a\t h:i A') }} &mdash; Library Management System
    </div>
</body>
</html>