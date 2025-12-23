<?php

namespace App\Http\Requests\BankUser;

use Illuminate\Foundation\Http\FormRequest;

class BankUserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bank_id' => 'required|exists:banks,id',
        ];
    }
}
