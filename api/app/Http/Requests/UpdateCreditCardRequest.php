<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCreditCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'number' => 'required|string',
            'holder_name' => 'required|string',
            'holder_document' => 'required|string',
            'exp_month' => 'required|string|size:2',
            'exp_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
            'address_id' => 'nullable|exists:addresses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'number.required' => 'O número do cartão é obrigatório',
            'holder_name.required' => 'O nome do portador é obrigatório',
            'holder_document.required' => 'O documento do portador é obrigatório',
            'exp_month.required' => 'O mês de expiração é obrigatório',
            'exp_month.size' => 'O mês de expiração deve ter 2 dígitos',
            'exp_year.required' => 'O ano de expiração é obrigatório',
            'exp_year.size' => 'O ano de expiração deve ter 4 dígitos',
            'cvv.required' => 'O CVV é obrigatório',
            'cvv.min' => 'O CVV deve ter no mínimo 3 dígitos',
            'cvv.max' => 'O CVV deve ter no máximo 4 dígitos',
        ];
    }
}

