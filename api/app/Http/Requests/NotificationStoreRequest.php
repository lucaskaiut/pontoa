<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotificationStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $requiredRule = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'time_before' => [
                $requiredRule,
                'integer',
                'min:1'
            ],
            'time_unit' => [
                $requiredRule,
                'in:days,hours,minutes'
            ],
            'message' => [
                $requiredRule,
                'string',
                'min:3'
            ],
            'active' => [
                $requiredRule,
                'boolean'
            ],
            'email_enabled' => [
                $requiredRule,
                'boolean'
            ],
            'whatsapp_enabled' => [
                $requiredRule,
                'boolean'
            ],
            'is_confirmation' => [
                'sometimes',
                'boolean'
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->isMethod('post')) {
                if (!$this->email_enabled && !$this->whatsapp_enabled) {
                    $validator->errors()->add('channels', 'Pelo menos um canal de notificação deve estar habilitado.');
                }

                return;
            }

            $emailProvided = $this->has('email_enabled');
            $whatsappProvided = $this->has('whatsapp_enabled');

            if ($emailProvided || $whatsappProvided) {
                $email = $emailProvided ? (bool) $this->email_enabled : true;
                $whats = $whatsappProvided ? (bool) $this->whatsapp_enabled : true;

                if (!$email && !$whats) {
                    $validator->errors()->add('channels', 'Pelo menos um canal de notificação deve estar habilitado.');
                }
            }
        });
    }
}
