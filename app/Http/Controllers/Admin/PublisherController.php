<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Publisher;

class PublisherController extends Controller
{
    public function index(Request $request)
    {
        $query = Publisher::latest();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%")
                  ->orWhere('contact_email', 'like', "%{$s}%");
        }
        $publishers = $query->paginate(10)->withQueryString();
        return view('admin.publishers.index', compact('publishers'));
    }

    public function create()
    {
        return view('admin.publishers.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        Publisher::create($validated);
        return redirect()->route('admin.publishers.index')->with('success', 'Publisher created successfully.');
    }

    public function edit(Publisher $publisher)
    {
        return view('admin.publishers.edit', compact('publisher'));
    }

    public function update(Request $request, Publisher $publisher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $publisher->update($validated);
        return redirect()->route('admin.publishers.index')->with('success', 'Publisher updated successfully.');
    }

    public function destroy(Publisher $publisher)
    {
        $publisher->delete();
        return redirect()->route('admin.publishers.index')->with('success', 'Publisher deleted successfully.');
    }
}
