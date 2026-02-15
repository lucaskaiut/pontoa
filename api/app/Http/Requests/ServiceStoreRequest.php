<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceStoreRequest extends FormRequest
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
            'name' => [
                'required',
                'min:3'
            ],
            'duration' => [
                'integer',
                'required'
            ],
            'description' => [
                'sometimes',
                'nullable',
                'min:3'
            ],
            'photo' => [
                'sometimes',
                'nullable',
                'file'
            ],
            'cost' => [
                'numeric',
            ],
            'price' => [
                'required',
                'numeric'
            ],
            'commission' => [
                'numeric'
            ],
            'status' => [
                'required',
                'boolean'
            ],
        ];
    }
}
