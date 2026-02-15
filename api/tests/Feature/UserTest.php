<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class userTest extends TestCase
{
    use WithFaker;

    public function test_register_admin()
    {
        $userData = [
            'company' => [
                'name' => "{$this->faker->firstName()} {$this->faker->lastName()}",
                'email' => $this->faker->email(),
                'phone' => $this->faker->phoneNumber(),
                'document' => $this->faker->cnpj(true),
            ],
            'user' => [
                'name' => "{$this->faker->firstName()} {$this->faker->lastName()}",
                'email' => $this->faker->email(),
                'password' => $this->faker->password(),
                'phone' => $this->faker->phoneNumber(),
                'document' => $this->faker->cpf(true),
            ],
        ];

        $response = $this->post('/api/users/register', $userData);

        $response->assertStatus(201);
    }

    public function test_user_login()
    {
        $userData = [
            'company' => [
                'name' => "{$this->faker->firstName()} {$this->faker->lastName()}",
                'email' => $this->faker->email(),
                'phone' => $this->faker->phoneNumber(),
                'document' => $this->faker->cnpj(true),
            ],
            'user' => [
                'name' => "{$this->faker->firstName()} {$this->faker->lastName()}",
                'email' => $this->faker->email(),
                'password' => $this->faker->password(),
                'phone' => $this->faker->phoneNumber(),
                'document' => $this->faker->cpf(true),
            ],
        ];

        $this->post('/api/users/register', $userData);

        $response = $this->post('/api/users/login', [
            'email' => $userData['user']['email'],
            'password' => $userData['user']['password'],
        ]);

        $response->assertStatus(200);
    }
}
