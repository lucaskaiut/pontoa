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
            // Support both old format (plan) and new format (plan_type + plan_recurrence)
            'company.plan' => [
                'sometimes',
                function ($attribute, $value, $fail) {
                    if ($value && ! in_array($value, ['monthly', 'quarterly', 'yearly'])) {
                        $fail("The {$attribute} must be one either monthly, quarterly or yearly");
                    }
                },
            ],
            'company.plan_type' => 'sometimes|in:basic,pro',
            'company.plan_recurrence' => 'sometimes|in:monthly,yearly',
            'company.address' => 'sometimes|array',
            'company.address.postcode' => 'required_with:company.address|string|size:8',
            'company.address.address' => 'required_with:company.address|string',
            'company.address.number' => 'required_with:company.address|string',
            'company.address.complement' => 'nullable|string',
            'company.address.district' => 'required_with:company.address|string',
            'company.address.region' => 'required_with:company.address|string|size:2',
            'company.address.city' => 'required_with:company.address|string',
            // 'company.credit_card' => 'required|array',
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
