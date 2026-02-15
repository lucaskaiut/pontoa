<?php

namespace Database\Factories;

use App\Models\Scheduling;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchedulingFactory extends Factory
{
    protected $model = Scheduling::class;

    public function definition(): array
    {
        return [
            'customer_id' => 1,
            'company_id' => 1,
            'user_id' => 1,
            'service_id' => 1,
            'date' => fake()->dateTimeBetween('now', '+3 months'),
            'cost' => fake()->randomFloat(2, 10, 100),
            'price' => fake()->randomFloat(2, 50, 500),
            'commission' => fake()->randomFloat(2, 5, 50),
            'payment_reference' => fake()->optional()->uuid(),
            'payment_method' => fake()->optional()->randomElement(['credit_card', 'debit_card', 'pix', 'cash']),
            'payment_status' => fake()->randomElement(['awaiting_payment', 'paid', 'cancelled', 'refunded']),
            'status' => fake()->randomElement(['pending', 'confirmed', 'cancelled', 'no_show']),
        ];
    }
}
