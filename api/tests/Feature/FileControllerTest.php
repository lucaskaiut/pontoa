<?php

namespace Tests\Feature;

use App\Models\File;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class FileControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_list_files_with_authentication()
    {
        File::create([
            'company_id' => $this->company->id,
            'name' => 'test.pdf',
            'path' => 'files/test.pdf',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/files');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                ],
            ]);
    }

    public function test_cannot_list_files_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/files');

        $response->assertStatus(401);
    }

    public function test_can_create_file_with_authentication()
    {
        $file = \Illuminate\Http\UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->post('/api/files', [
                'name' => 'test.pdf',
                'file' => $file,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
            ]);

        $this->assertDatabaseHas('files', [
            'name' => 'test.pdf',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_can_show_file_with_authentication()
    {
        $file = File::create([
            'company_id' => $this->company->id,
            'name' => 'test.pdf',
            'path' => 'files/test.pdf',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/files/{$file->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
            ]);
    }

    public function test_can_update_file_with_authentication()
    {
        $file = File::create([
            'company_id' => $this->company->id,
            'name' => 'test.pdf',
            'path' => 'files/test.pdf',
        ]);

        $updateData = [
            'name' => 'updated.pdf',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/files/{$file->id}", $updateData);

        $response->assertStatus(200);
    }

    public function test_can_delete_file_with_authentication()
    {
        $file = File::create([
            'company_id' => $this->company->id,
            'name' => 'test.pdf',
            'path' => 'files/test.pdf',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/files/{$file->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('files', [
            'id' => $file->id,
        ]);
    }
}
