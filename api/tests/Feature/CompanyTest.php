<?php

namespace Tests\Feature;

use App\Models\Company;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_company_has_parent_relationship()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompany = Company::create([
            'name' => 'Child Company',
            'email' => 'child@test.com',
            'phone' => '11888888888',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child.test',
            'parent_id' => $parentCompany->id,
        ]);

        $this->assertNotNull($childCompany->parent);
        $this->assertEquals($parentCompany->id, $childCompany->parent->id);
        $this->assertEquals('Parent Company', $childCompany->parent->name);
    }

    public function test_company_has_children_relationship()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompany1 = Company::create([
            'name' => 'Child Company 1',
            'email' => 'child1@test.com',
            'phone' => '11888888888',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child1.test',
            'parent_id' => $parentCompany->id,
        ]);

        $childCompany2 = Company::create([
            'name' => 'Child Company 2',
            'email' => 'child2@test.com',
            'phone' => '11777777777',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child2.test',
            'parent_id' => $parentCompany->id,
        ]);

        $children = $parentCompany->children;

        $this->assertCount(2, $children);
        $this->assertTrue($children->contains($childCompany1));
        $this->assertTrue($children->contains($childCompany2));
    }

    public function test_company_can_have_multiple_children()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompanies = [];
        for ($i = 0; $i < 5; $i++) {
            $childCompanies[] = Company::create([
                'name' => "Child Company {$i}",
                'email' => "child{$i}@test.com",
                'phone' => $this->faker->numerify('###########'),
                'document' => $this->faker->cnpj(false),
                'domain' => "child{$i}.test",
                'parent_id' => $parentCompany->id,
            ]);
        }

        $this->assertCount(5, $parentCompany->children);
    }

    public function test_company_parent_can_be_null()
    {
        $company = Company::create([
            'name' => 'Independent Company',
            'email' => 'independent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'independent.test',
            'parent_id' => null,
        ]);

        $this->assertNull($company->parent_id);
        $this->assertNull($company->parent);
        $this->assertCount(0, $company->children);
    }

    public function test_company_scope_children_of()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompany1 = Company::create([
            'name' => 'Child Company 1',
            'email' => 'child1@test.com',
            'phone' => '11888888888',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child1.test',
            'parent_id' => $parentCompany->id,
        ]);

        $childCompany2 = Company::create([
            'name' => 'Child Company 2',
            'email' => 'child2@test.com',
            'phone' => '11777777777',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child2.test',
            'parent_id' => $parentCompany->id,
        ]);

        $otherCompany = Company::create([
            'name' => 'Other Company',
            'email' => 'other@test.com',
            'phone' => '11666666666',
            'document' => $this->faker->cnpj(false),
            'domain' => 'other.test',
            'parent_id' => null,
        ]);

        $children = Company::childrenOf($parentCompany->id)->get();

        $this->assertCount(2, $children);
        $this->assertTrue($children->contains($childCompany1));
        $this->assertTrue($children->contains($childCompany2));
        $this->assertFalse($children->contains($otherCompany));
    }
}

