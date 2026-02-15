<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Review;
use App\Models\Scheduling;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_create_review_publicly()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $reviewData = [
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/reviews', $reviewData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'score',
                'comment',
            ]);
    }

    public function test_can_list_public_reviews()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
            'is_public' => true,
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/reviews/public?company_id={$this->company->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'score',
                    'comment',
                ],
            ]);
    }

    public function test_can_get_my_reviews_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        $service = $this->createService($this->company, $this->authenticatedUser);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/reviews/my-reviews');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'score',
                    'comment',
                ],
            ]);
    }

    public function test_cannot_get_my_reviews_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/reviews/my-reviews');

        $response->assertStatus(401);
    }

    public function test_can_list_reviews_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/reviews');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'score',
                        'comment',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_reviews_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/reviews');

        $response->assertStatus(403);
    }

    public function test_can_show_review_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $review = Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'score',
                    'comment',
                ],
            ]);
    }

    public function test_can_update_review_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $review = Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ]);

        $updateData = [
            'score' => 10,
            'comment' => 'Excellent service!',
            'is_public' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/reviews/{$review->id}", $updateData);

        $response->assertStatus(200);
    }

    public function test_can_delete_review_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $review = Review::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'appointment_id' => $scheduling->id,
            'score' => 9,
            'comment' => 'Great service!',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/reviews/{$review->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('reviews', [
            'id' => $review->id,
        ]);
    }
}
