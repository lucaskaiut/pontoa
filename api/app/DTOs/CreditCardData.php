<?php

namespace App\DTOs;

use Illuminate\Support\Facades\Validator;

final class CreditCardData
{
    public string $source;
    public string $external_id;
    public ?string $first_six_digits;
    public ?string $last_four_digits;

    public function __construct(array $data)
    {
        $rules = [
            'source' => 'required|string',
            'external_id' => 'required|string',
            'first_six_digits' => 'nullable|string|size:6',
            'last_four_digits' => 'nullable|string|size:4',
        ];

        $validated = Validator::validate($data, $rules);

        $this->source = $validated['source'];
        $this->external_id = $validated['external_id'];
        $this->first_six_digits = $validated['first_six_digits'] ?? null;
        $this->last_four_digits = $validated['last_four_digits'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'source' => $this->source,
            'external_id' => $this->external_id,
            'first_six_digits' => $this->first_six_digits,
            'last_four_digits' => $this->last_four_digits,
        ];
    }
}