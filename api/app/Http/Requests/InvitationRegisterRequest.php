<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvitationRegisterRequest extends FormRequest
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
        return [
            'name' => 'required',
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
            'password' => 'required',
        ];
    }
}
