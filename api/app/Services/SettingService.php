<?php

namespace App\Services;

use App\Enums\SettingKey;
use App\Models\Setting;

final class SettingService
{
    public function get(string $key): ?string
    {
        $setting = Setting::where('key', $key)->first();

        return $setting?->value ?? null;
    }

    public function save(string $key, mixed $value, ?string $label = null, ?string $type = 'text', ?bool $isPublic = false): Setting
    {
        $companyId = app('company')->company()->id;
        
        $settingKey = SettingKey::fromValue($key);
        
        if ($settingKey) {
            $label = $label ?? $settingKey->label();
            $typeForEnum = $settingKey->type();
            $type = $typeForEnum === 'multiselect' ? 'array' : $typeForEnum;
            $isPublic = $isPublic ?? $settingKey->isPublic();
        }

        $setting = Setting::firstOrNew(
            [
                'key' => $key,
                'company_id' => $companyId,
            ]
        );

        $setting->type = $type;
        $setting->label = $label;
        $setting->is_public = $isPublic;
        $setting->value = $value;
        $setting->save();

        return $setting;
    }

    public function list(array $filters = []): array
    {
        $isPublicOnly = isset($filters['isPublic']) && filter_var($filters['isPublic'], FILTER_VALIDATE_BOOLEAN);

        $query = Setting::query();

        if ($isPublicOnly) {
            $query->where(function ($q) {
                $q->where('is_public', true);
                foreach (SettingKey::cases() as $settingKey) {
                    if ($settingKey->isPublic()) {
                        $q->orWhere('key', $settingKey->value);
                    }
                }
            });
        } elseif (! empty($filters)) {
            $query->filterBy($filters);
        }

        $settings = $query->get();
        $settingsMap = [];

        foreach ($settings as $setting) {
            $settingKeyEnum = SettingKey::fromValue($setting->key);
            $type = $setting->type;
            
            if ($settingKeyEnum && $settingKeyEnum->type() === 'multiselect' && $type === 'array') {
                $type = 'multiselect';
            }
            
            $settingsMap[$setting->key] = [
                'value' => $setting->value,
                'label' => $setting->label,
                'type' => $type,
            ];
        }

        $result = [];

        foreach (SettingKey::cases() as $settingKey) {
            $key = $settingKey->value;
            
            if ($isPublicOnly && !$settingKey->isPublic()) {
                continue;
            }
            
            if (isset($settingsMap[$key])) {
                $result[$key] = $settingsMap[$key];
                if ($settingKey->type() === 'multiselect' && $settingKey->options() !== null) {
                    $result[$key]['options'] = $settingKey->options();
                }
            } else {
                $defaultValue = $settingKey->defaultValue();
                
                $result[$key] = [
                    'value' => $defaultValue,
                    'label' => $settingKey->label(),
                    'type' => $settingKey->type(),
                ];
                
                if ($settingKey->type() === 'multiselect' && $settingKey->options() !== null) {
                    $result[$key]['options'] = $settingKey->options();
                }
            }
        }

        return $result;
    }
}
