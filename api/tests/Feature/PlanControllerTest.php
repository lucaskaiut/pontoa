<?php

namespace Tests\Feature;

use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class PlanControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_list_plans_publicly()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/plans');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'type',
                        'recurrence',
                        'price',
                    ],
                ],
            ]);
    }

    public function test_plans_response_contains_expected_structure()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/plans');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertNotEmpty($data);
    }
}
