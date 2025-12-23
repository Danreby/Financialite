<?php

namespace App\Http\Requests\Bank;

use Illuminate\Foundation\Http\FormRequest;

class AttachBankToUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bank_id' => 'required|exists:banks,id',
            'due_day' => 'nullable|integer|min:1|max:31',
        ];
    }
}
