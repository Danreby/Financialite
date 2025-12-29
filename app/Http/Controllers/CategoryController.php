<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\CategoryStoreRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use App\Models\Category;
use App\Models\Notification;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::forUser($user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    public function store(CategoryStoreRequest $request)
    {
        $user = $request->user();

        $data = $this->normalizeInsertData($request->validated());

        $category = Category::create([
            'name' => $data['name'],
            'user_id' => $user->id,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Categoria criada',
            'message' => 'Uma nova categoria foi adicionada.',
            'type' => 'info',
        ]);

        return response()->json($category, 201);
    }

    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $user = $request->user();

        if ($category->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $this->normalizeInsertData($request->validated());

        $category->update([
            'name' => $data['name'],
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Categoria atualizada',
            'message' => 'Uma categoria foi atualizada.',
            'type' => 'info',
        ]);

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        $user = $request->user();

        if ($category->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $category->delete();

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Categoria removida',
            'message' => 'Uma categoria foi removida.',
            'type' => 'info',
        ]);

        return response()->json(['message' => 'Categoria removida.']);
    }
}
