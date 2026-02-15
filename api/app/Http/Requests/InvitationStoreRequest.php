<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class InvitationStoreRequest extends FormRequest
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
            'email' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (DB::table('users')->where('email', $value)->count() > 0) {
                        $fail("The {$attribute} is already registered");
                    }
                },
                'unique:invitations,email'   
            ],
        ];
    }
}
