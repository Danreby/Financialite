<?php

namespace App\Http\Requests\Fatura;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FaturaUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'type' => ['sometimes', 'required', Rule::in(['credit', 'debit'])],
            'status' => ['nullable', Rule::in(['paid', 'unpaid', 'overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }),
            ],
        ];
    }
}
