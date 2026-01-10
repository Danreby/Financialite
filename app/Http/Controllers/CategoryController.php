<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\CategoryStoreRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use App\Models\Category;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::forUser($user->id)
            ->ordered()
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    public function store(CategoryStoreRequest $request)
    {
        $user = $request->user();

        $data = $this->normalizeInsertData($request->validated());
        $category = DB::transaction(function () use ($data, $user) {
            $category = Category::create([
                'name' => $data['name'],
                'user_id' => $user->id,
            ]);

            $this->notifications->info($user, 'Categoria criada', 'Uma nova categoria foi adicionada.');

            return $category;
        });

        return response()->json($category, 201);
    }

    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $user = $request->user();

        if ($category->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $this->normalizeInsertData($request->validated());
        DB::transaction(function () use ($category, $data, $user) {
            $category->update([
                'name' => $data['name'],
            ]);

            $this->notifications->info($user, 'Categoria atualizada', 'Uma categoria foi atualizada.');
        });

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        $user = $request->user();

        if ($category->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        DB::transaction(function () use ($category, $user) {
            $category->delete();

            $this->notifications->info($user, 'Categoria removida', 'Uma categoria foi removida.');
        });

        return response()->json(['message' => 'Categoria removida.']);
    }
}
