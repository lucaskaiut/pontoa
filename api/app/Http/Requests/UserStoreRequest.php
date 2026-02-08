<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
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
        if ($this->has('type')) {
            $this->request->remove('type');
        }
    }

    public function rules()
    {
        return [
            'name' => 'required',
            'email' => [
                'required',
                Rule::unique('users', 'email')->where(fn ($query) => $query->where('company_id', app('company')->company->id)),
            ],
            'phone' => 'required',
            'document' => [
                'required',
                function ($attribute, $value, $fail) {
                    $formatedValue = preg_replace('/[^0-9]/', '', $value);

                    if (strlen($formatedValue) < 11 || strlen($formatedValue) > 14) {
                        $fail("The {$attribute} must have at least 11 characteres and must not have more than 14 characteres");
                    }

                    if (DB::table('users')->where('document', $formatedValue)->where('company_id', app('company')->company->id)->count() > 0) {
                        $fail("The {$attribute} has already been taken.");
                    }
                },
            ],
            'password' => 'required',
            'image' => 'sometimes|string',
            'description' => 'sometimes|nullable|string',
            'url' => 'sometimes|nullable|string',
            'services' => [
                'sometimes',
                'array',
            ],
            'services.*.name' => 'required_with:services|min:3',
            'services.*.duration' => 'required_with:services|integer',
            'services.*.description' => 'sometimes|nullable|min:3',
            'services.*.photo' => 'sometimes|nullable|file',
            'services.*.cost' => 'sometimes|nullable|numeric',
            'services.*.price' => 'required_with:services|numeric',
            'services.*.commission' => 'sometimes|nullable|numeric',
            'services.*.status' => 'required_with:services|boolean',
            'schedules' => [
                'sometimes',
                'array',
            ],
            'schedules.*.days' => 'required_with:schedules|string',
            'schedules.*.start_at' => 'required_with:schedules',
            'schedules.*.end_at' => 'required_with:schedules',
            'schedules.*.services' => 'required_with:schedules|array',
        ];
    }
}
