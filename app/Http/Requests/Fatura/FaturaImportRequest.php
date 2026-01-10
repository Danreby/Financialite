<?php

namespace App\Http\Requests\Fatura;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FaturaImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.title' => ['required', 'string', 'max:255'],
            'rows.*.description' => ['nullable', 'string'],
            'rows.*.amount' => ['required', 'numeric', 'min:0'],
            'rows.*.type' => ['required', 'string', Rule::in(['credit', 'debit'])],
            'rows.*.status' => ['nullable', 'string', Rule::in(['unpaid', 'paid', 'overdue'])],
            'rows.*.total_installments' => ['nullable', 'integer', 'min:1', 'max:360'],
            'rows.*.current_installment' => ['nullable', 'integer', 'min:0', 'max:360'],
            'rows.*.is_recurring' => ['nullable'],
            'rows.*.bank_user_name' => ['nullable', 'string', 'max:255'],
            'rows.*.category_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
