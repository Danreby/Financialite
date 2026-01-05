<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;
        $categoryParam = $this->route('category');
        $categoryId = is_object($categoryParam) && method_exists($categoryParam, 'getKey')
            ? $categoryParam->getKey()
            : $categoryParam;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')
                    ->ignore($categoryId)
                    ->where(fn ($query) => $query->where('user_id', $userId)),
            ],
        ];
    }
}
