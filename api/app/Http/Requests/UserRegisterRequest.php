<?php

namespace App\Http\Requests;

use App\Models\Company;
use Illuminate\Foundation\Http\FormRequest;

class UserRegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('user.type')) {
            $userData = $this->input('user', []);
            unset($userData['type']);
            $this->merge(['user' => $userData]);
        }
    }

    public function rules()
    {
        return [
            'company' => 'required',
            'company.name' => 'required',
            'company.email' => 'required',
            'company.phone' => 'required',
            'company.document' => 'required|unique:App\Models\Company,document',
            'company.logo' => 'sometimes|string',
            'company.banner' => 'sometimes|string',
            'user' => 'required',
            'user.name' => 'required',
            'user.email' => [
                'required',
                'email',
                'unique:users,email',
            ],
            'user.phone' => 'required',
            'user.document' => [
                'required',
                function ($attribute, $value, $fail) {
                    $formatedValue = preg_replace('/[^0-9]/', '', $value);

                    if (strlen($formatedValue) < 11 || strlen($formatedValue) > 14) {
                        $fail("The {$attribute} must have at least 11 characteres and must not have more than 14 characteres");
                    }
                },
            ],
            'user.password' => 'required',
            'user.image' => 'sometimes|string',
            'user.description' => 'sometimes|nullable|string',
            'user.url' => 'sometimes|nullable|string',
        ];
    }
}
