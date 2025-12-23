<?php

namespace App\Http\Requests\Fatura;

use Illuminate\Foundation\Http\FormRequest;

class PayMonthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'month' => 'required|date_format:Y-m',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ];
    }
}
