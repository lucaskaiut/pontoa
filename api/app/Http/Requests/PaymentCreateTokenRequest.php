<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentCreateTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'method' => 'required|string',
            'number' => 'required|string',
            'holder_name' => 'required|string',
            'holder_document' => 'required|string',
            'exp_month' => 'required|string|size:2',
            'exp_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
        ];
    }
}
