<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = app('company')->company()->id;

        return [
            'appointment_id' => [
                'required',
                'exists:schedulings,id',
                function ($attribute, $value, $fail) use ($companyId) {
                    $scheduling = \App\Models\Scheduling::find($value);
                    if ($scheduling && $scheduling->company_id !== $companyId) {
                        $fail('O agendamento não pertence à empresa.');
                    }
                },
            ],
            'score' => [
                'required',
                'integer',
                'min:0',
                'max:10',
            ],
            'comment' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }
}
