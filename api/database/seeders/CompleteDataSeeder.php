<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use App\Services\OrderItemFactory;
use App\Services\OrderService;
use App\Services\PostPaymentHandler;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompleteDataSeeder extends Seeder
{
    public function run(): void
    {
        $companiesCount = Company::count();

        if ($companiesCount !== 1) {
            $this->command->error("Seeder só pode ser executado quando houver exatamente 1 company no banco. Encontradas: {$companiesCount}");
            return;
        }

        $baseCompany = Company::find(1);
        
        if (!$baseCompany) {
            $this->command->error('Company com ID 1 não encontrada.');
            return;
        }

        $orderService = new OrderService();
        $orderItemFactory = new OrderItemFactory();
        $postPaymentHandler = new PostPaymentHandler();

        for ($companyIndex = 1; $companyIndex <= 5; $companyIndex++) {
            $this->command->info("Criando dados para company {$companyIndex}...");

            $company = Company::create([
                'name' => "Empresa {$companyIndex}",
                'email' => "empresa{$companyIndex}@example.com",
                'phone' => $this->generatePhone(),
                'document' => $this->generateCnpj(),
                'domain' => "empresa{$companyIndex}.test",
                'active' => true,
                'parent_id' => 1,
            ]);

            app('company')->registerCompany($company);

            $users = [];
            for ($userIndex = 1; $userIndex <= 2; $userIndex++) {
                $user = User::create([
                    'name' => "Usuário {$userIndex} - Empresa {$companyIndex}",
                    'email' => "usuario{$userIndex}empresa{$companyIndex}@example.com",
                    'password' => Hash::make('password123'),
                    'phone' => $this->generatePhone(),
                    'document' => $this->generateCpf(),
                    'type' => 'admin',
                    'company_id' => $company->id,
                ]);

                $users[] = $user;

                $userServices = [];
                for ($serviceIndex = 1; $serviceIndex <= 2; $serviceIndex++) {
                    $service = Service::create([
                        'company_id' => $company->id,
                        'user_id' => $user->id,
                        'name' => "Serviço {$serviceIndex} - {$user->name}",
                        'description' => "Descrição do serviço {$serviceIndex}",
                        'price' => rand(50, 500) + (rand(0, 99) / 100),
                        'cost' => rand(20, 200) + (rand(0, 99) / 100),
                        'commission' => rand(5, 50) + (rand(0, 99) / 100),
                        'status' => true,
                        'duration' => rand(30, 120),
                    ]);
                    $userServices[] = $service;
                }

                $schedule = Schedule::create([
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                    'days' => '0,1,2,3,4,5,6',
                    'start_at' => '08:00:00',
                    'end_at' => '18:00:00',
                ]);

                $schedule->services()->sync(array_column($userServices, 'id'));
            }

            $customers = [];
            for ($customerIndex = 1; $customerIndex <= 5; $customerIndex++) {
                $customer = Customer::create([
                    'name' => "Cliente {$customerIndex} - Empresa {$companyIndex}",
                    'email' => "cliente{$customerIndex}empresa{$companyIndex}@example.com",
                    'password' => Hash::make('password123'),
                    'phone' => $this->generatePhone(),
                    'document' => $this->generateCpf(),
                    'status' => true,
                    'company_id' => $company->id,
                ]);

                $customers[] = $customer;
            }

            foreach ($customers as $customer) {
                $user = $users[array_rand($users)];
                $userServices = Service::where('user_id', $user->id)
                    ->where('company_id', $company->id)
                    ->get();

                if ($userServices->isEmpty()) {
                    continue;
                }

                $service = $userServices->random();
                $daysToAdd = rand(1, 30);
                $hour = rand(9, 17);
                $futureDate = Carbon::now()->addDays($daysToAdd)->setHour($hour)->setMinute(0)->setSecond(0);

                $order = Order::create([
                    'company_id' => $company->id,
                    'customer_id' => $customer->id,
                    'status' => 'new',
                    'total_amount' => 0,
                    'original_total_amount' => 0,
                    'discount_amount' => 0,
                ]);

                $schedulingData = [
                    'service_id' => $service->id,
                    'user_id' => $user->id,
                    'date' => $futureDate->format('Y-m-d H:i:s'),
                    'customer' => [
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'phone' => $customer->phone,
                    ],
                ];

                $itemData = $orderItemFactory->createScheduling($schedulingData);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'item_type' => $itemData['item_type'],
                    'item_id' => $itemData['item_id'],
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price'],
                    'original_unit_price' => $itemData['unit_price'],
                    'original_total_price' => $itemData['total_price'],
                    'metadata' => $itemData['metadata'],
                ]);

                $order->update([
                    'status' => 'paid',
                    'total_amount' => $orderItem->total_price,
                    'original_total_amount' => $orderItem->total_price,
                    'paid_at' => Carbon::now(),
                    'payment_method' => 'seed',
                    'payment_reference' => 'seed-' . $order->id,
                ]);

                $postPaymentHandler->handleItem($orderItem->fresh());
            }

            $this->command->info("Company {$companyIndex} criada com sucesso!");
        }

        $this->command->info('Seeder executado com sucesso!');
        $this->command->info('5 companies criadas, cada uma com:');
        $this->command->info('- 2 usuários');
        $this->command->info('- 2 serviços por usuário');
        $this->command->info('- 5 clientes');
        $this->command->info('- 1 agendamento por cliente (criado via order)');
    }

    private function generatePhone(): string
    {
        return '11' . str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
    }

    private function generateCpf(): string
    {
        $n1 = rand(100, 999);
        $n2 = rand(100, 999);
        $n3 = rand(100, 999);
        $d1 = rand(10, 99);
        return "{$n1}{$n2}{$n3}{$d1}";
    }

    private function generateCnpj(): string
    {
        $n1 = rand(10, 99);
        $n2 = rand(100, 999);
        $n3 = rand(100, 999);
        $n4 = rand(1000, 9999);
        $d = rand(10, 99);
        return "{$n1}{$n2}{$n3}{$n4}{$d}";
    }
}

