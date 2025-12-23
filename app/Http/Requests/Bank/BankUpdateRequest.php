<?php

namespace App\Http\Requests\Bank;

use Illuminate\Foundation\Http\FormRequest;

class BankUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $bankId = $this->route('bank');

        return [
            'name' => 'required|string|max:255|unique:banks,name,' . $bankId,
            'due_day' => 'nullable|integer|min:1|max:31',
        ];
    }
}
