<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser([Permissions::MANAGE_REPORTS]);
    }

    public function test_can_get_report_with_permission()
    {
        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/report/revenue');

        $response->assertStatus(200);
    }

    public function test_cannot_get_report_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/report/revenue');

        $response->assertStatus(403);
    }

    public function test_cannot_get_report_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/report/revenue');

        $response->assertStatus(401);
    }
}
