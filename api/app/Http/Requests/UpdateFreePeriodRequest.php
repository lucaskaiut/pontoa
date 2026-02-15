<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFreePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth()->user();

        return $user && $user->type === 'superadmin';
    }

    public function rules(): array
    {
        return [
            'is_free' => 'required|boolean',
            'current_period_end' => 'required_if:is_free,true|nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'is_free.required' => 'O campo is_free é obrigatório',
            'is_free.boolean' => 'O campo is_free deve ser verdadeiro ou falso',
            'current_period_end.required_if' => 'O campo current_period_end é obrigatório quando is_free é verdadeiro',
            'current_period_end.date' => 'O campo current_period_end deve ser uma data válida',
        ];
    }
}
