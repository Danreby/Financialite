<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create([
            'name' => $data['name'],
            'user_id' => $user->id,
        ]);

        return response()->json($category, 201);
    }
}
