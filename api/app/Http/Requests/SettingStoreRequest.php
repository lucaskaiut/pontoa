<?php

namespace App\Http\Requests;

use App\Enums\SettingKey;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class SettingStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [];
        
        foreach (SettingKey::cases() as $settingKey) {
            $key = $settingKey->value;
            $type = $settingKey->type();
            
            $rule = ['sometimes', 'nullable'];
            
            if ($type === 'int' || $type === 'integer') {
                $rule[] = 'integer';
            } elseif ($type === 'bool' || $type === 'boolean') {
                $rule[] = 'boolean';
            } elseif ($type === 'float' || $type === 'double') {
                $rule[] = 'numeric';
            } elseif ($type === 'multiselect' || $type === 'array') {
                $rule[] = 'array';
            } elseif ($type === 'json') {
                $rule[] = 'json';
            } else {
                $rule[] = 'string';
            }
            
            $rules[$key] = $rule;
        }

        return $rules;
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        $allowedKeys = SettingKey::all();
        $settings = [];
        
        foreach ($allowedKeys as $allowedKey) {
            if (isset($validated[$allowedKey])) {
                $settings[$allowedKey] = $validated[$allowedKey];
            }
        }
        
        if (empty($settings)) {
            throw ValidationException::withMessages([
                'settings' => 'É necessário informar pelo menos uma das configurações permitidas: ' . implode(', ', $allowedKeys),
            ]);
        }
        
        return $settings;
    }
}

