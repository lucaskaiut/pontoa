<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth()->user();
        return $user && $user->type === 'superadmin';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:companies,email',
            'phone' => 'required|string|max:20',
            'document' => 'required|string|unique:companies,document',
            'domain' => 'required|string|unique:companies,domain',
            'support_phone' => 'nullable|string|max:20',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ];
    }
}

