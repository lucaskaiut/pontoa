<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRegisterRequest extends FormRequest
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

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $companyId = app('company')->company()->id;

        return [
            'name' => 'required',
            'email' => [
                'required',
                'email',
                Rule::unique('customers', 'email')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'phone' => 'required',
            'document' => [
                'required',
                function ($attribute, $value, $fail) {
                    $formatedValue = preg_replace('/[^0-9]/', '', $value);

                    if (strlen($formatedValue) < 11 || strlen($formatedValue) > 14) {
                        $fail("The {$attribute} must have at least 11 characteres and must not have more than 14 characteres");
                    }
                },
            ],
            'password' => 'nullable',
        ];
    }
}
