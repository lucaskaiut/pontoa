<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_type' => ['required', 'string', Rule::in(['basic', 'pro'])],
            'recurrence_type' => ['required', 'string', Rule::in(['monthly', 'yearly'])],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'card_id' => ['nullable', 'integer', 'exists:cards,id'],
            'credit_card' => ['nullable', 'array'],
            'credit_card.number' => ['required_with:credit_card', 'string'],
            'credit_card.holder_name' => ['required_with:credit_card', 'string'],
            'credit_card.holder_document' => ['required_with:credit_card', 'string'],
            'credit_card.exp_month' => ['required_with:credit_card', 'string', 'size:2'],
            'credit_card.exp_year' => ['required_with:credit_card', 'string', 'size:4'],
            'credit_card.cvv' => ['required_with:credit_card', 'string', 'min:3', 'max:4'],
            'credit_card.address_id' => ['nullable', 'exists:addresses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'plan_type.required' => 'O tipo de plano é obrigatório',
            'plan_type.in' => 'O tipo de plano deve ser basic ou pro',
            'recurrence_type.required' => 'O tipo de recorrência é obrigatório',
            'recurrence_type.in' => 'O tipo de recorrência deve ser monthly ou yearly',
        ];
    }
}
