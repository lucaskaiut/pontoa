<?php 

namespace App\Services;

use App\Mail\CustomerFirstAccess;
use App\Models\Customer;
use App\Utilities\PhoneNormalizer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class CustomerService 
{
    private function normalizePhone(?string $phone): ?string
    {
        return PhoneNormalizer::normalize($phone);
    }

    private function identifierToPhone(string $identifier): string
    {
        return $this->normalizePhone($identifier) ?? '00000000000';
    }

    public function create(array $data): Customer
    {
        if (empty($data['password'])) {
            $data['should_reset_password'] = true;
            $data['first_access_token'] = Str::uuid()->toString();
        }

        if (isset($data['phone'])) {
            $data['phone'] = $this->normalizePhone($data['phone']);
        }

        $customer = Customer::create($data);

        return $customer;
    }

    public function login(array $data, int $companyId): array
    {
        $customer = Customer::where('email', $data['email'])->first();

        throw_if(!$customer, new NotFoundHttpException('Credenciais inválidas'));

        throw_if(!$customer->password, new NotFoundHttpException('Você precisa definir sua senha primeiro. Verifique seu email para o link de primeiro acesso.'));

        throw_if(!Hash::check($data['password'], $customer->password), new NotFoundHttpException('Credenciais inválidas'));

        $token = $customer->createToken('login');

        return [
            'token' => $token->plainTextToken,
            'customer' => $customer,
        ];
    }

    public function list(array $filters = [], int $companyId = null)
    {
        $customers = Customer::query();

        if (isset($filters['email'])) {
            $customers->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if (isset($filters['name'])) {
            $customers->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (isset($filters['createdAtFrom'])) {
            $customers->where('created_at', '>=', $filters['createdAtFrom']);
        }

        if (isset($filters['createdAtTo'])) {
            $customers->where('created_at', '<=', $filters['createdAtTo'] . ' 23:59:59');
        }

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['name', 'email', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $customers->orderBy($column, $direction);
                }
            }
        } else {
            $customers->orderBy('created_at', 'DESC');
        }

        return $customers->with('conversationContext')->paginate();
    }

    public function findOrFail($id): Customer
    {
        return Customer::findOrFail($id);
    }

    public function findByEmail(string $email, int $companyId): ?Customer
    {
        return Customer::where('email', $email)->first();
    }

    public function update(Customer $customer, array $data)
    {
        if (isset($data['phone'])) {
            $data['phone'] = $this->normalizePhone($data['phone']);
        }

        $customer->update($data);

        return $customer;
    }

    public function delete(Customer $customer)
    {
        $customer->delete();
    }

    public function resetPassword(Customer $customer, string $password): Customer
    {
        $customer->update([
            'password' => $password,
            'should_reset_password' => false,
            'first_access_token' => null,
        ]);

        return $customer;
    }

    public function firstAccess(string $token, string $password): array
    {
        $customer = Customer::where('first_access_token', $token)
            ->where('should_reset_password', true)
            ->first();

        throw_if(!$customer, new NotFoundHttpException('Token inválido ou expirado'));

        $customer->update([
            'password' => $password,
            'should_reset_password' => false,
            'first_access_token' => null,
        ]);

        $authToken = $customer->createToken('login');

        return [
            'token' => $authToken->plainTextToken,
            'customer' => $customer,
        ];
    }

    public function dispatchFirstAccessEmail(Customer $customer)
    {
        if ($customer->should_reset_password && $customer->first_access_token) {
            $customer->load('company');
            Mail::to($customer->email)->queue(new CustomerFirstAccess($customer));
        }
    }

    public function findOrCreateByPhone(string $phone): Customer
    {
        $normalizedPhone = $this->normalizePhone($phone);
        
        if (!$normalizedPhone) {
            $normalizedPhone = $this->identifierToPhone($phone);
        }

        $customer = Customer::where('phone', $normalizedPhone)->first();

        if (!$customer) {
            $companyId = app('company')->company()->id;
            
            $customer = Customer::create([
                'identifier' => $phone,
                'company_id' => $companyId,
                'phone' => $normalizedPhone,
                'name' => null,
                'email' => null,
                'status' => true,
            ]);
        }

        return $customer;
    }

    public function updateContext(string $identifier, string $context, int $companyId = 0): Customer
    {
        $customer = $this->findOrCreateByPhone($identifier);
        
        $customer->update([
            'context' => $context,
        ]);

        return $customer->fresh();
    }

    public function getContextByIdentifier(string $identifier, int $companyId = 0): ?string
    {
        $normalizedPhone = $this->normalizePhone($identifier);
        
        if (!$normalizedPhone) {
            $normalizedPhone = $this->identifierToPhone($identifier);
        }

        $customer = Customer::where('phone', $normalizedPhone)->first();

        return $customer?->context;
    }

    public function updateNotes(Customer $customer, string $notes): Customer
    {
        $currentContext = $customer->context ?? '';
        
        $customer->update([
            'context' => $notes,
        ]);

        return $customer->fresh();
    }
}

