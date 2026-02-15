<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompanyAndUserSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrCreate(
            [
                'name' => 'Salão Top Demais',
                'document' => '51477255000106',
                'email' => 'lucas.kaiut@gmail.com',
                'phone' => '41988475554'
            ],
            [
                'active' => true,
            ]
        );

        User::withoutEvents(function () use ($company) {
            return User::firstOrCreate(
                [
                    'email' => 'lucas.kaiut@gmail.com',
                ],
                [
                    'name' => 'Lucas Kaiut',
                    'document' => '11785492918',
                    'password' => 'abc@123',
                    'phone' => '41988475554',
                    'type' => 'admin',
                    'company_id' => $company->id,
                ]
            );
        });
    }
}


