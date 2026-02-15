<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Scheduling;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerAndSchedulingSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        if (!$company) {
            $this->command->error('Nenhuma empresa encontrada. Por favor, execute primeiro o CompanyAndUserSeeder.');
            return;
        }

        app('company')->registerCompany($company);

        $professional = $company->users()->first();

        if (!$professional) {
            $this->command->error('Nenhum profissional encontrado para a empresa. Por favor, crie um usuário primeiro.');
            return;
        }

        $service = $company->services()->first();

        if (!$service) {
            $service = Service::create([
                'company_id' => $company->id,
                'user_id' => $professional->id,
                'name' => 'Serviço Padrão',
                'description' => 'Serviço criado automaticamente pelo seeder',
                'price' => 100.00,
                'cost' => 50.00,
                'commission' => 10.00,
                'status' => true,
                'duration' => 60,
            ]);
        }

        $customers = Customer::factory()
            ->count(10)
            ->create([
                'company_id' => $company->id,
            ]);

        for ($i = 0; $i < 50; $i++) {
            Scheduling::factory()
                ->create([
                    'company_id' => $company->id,
                    'user_id' => $professional->id,
                    'service_id' => $service->id,
                    'customer_id' => $customers->random()->id,
                ]);
        }

        $this->command->info('Seeder executado com sucesso!');
        $this->command->info("10 clientes criados para a empresa: {$company->name}");
        $this->command->info("50 agendamentos criados para o profissional: {$professional->name}");
    }
}
