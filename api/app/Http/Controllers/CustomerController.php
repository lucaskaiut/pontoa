<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Requests\CustomerRegisterRequest;
use App\Http\Requests\CustomerLoginRequest;
use App\Http\Requests\CustomerResetPasswordRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\UnauthorizedException;

class CustomerController extends Controller
{
    protected CustomerService $service;

    public function __construct(CustomerService $service)
    {
        $this->service = $service;
    }

    public function register(CustomerRegisterRequest $request)
    {
        return DB::transaction(function () use ($request) { 
            return new CustomerResource($this->service->create($request->all()));
        });
    }

    public function login(CustomerLoginRequest $request)
    {
        $companyId = app('company')->company()->id;
        $response = $this->service->login($request->all(), $companyId);

        return [
            'token' => $response['token'],
            'user' => new CustomerResource($response['customer']),
        ];
    }

    public function firstAccess(Request $request, string $token)
    {
        $validated = $request->validate([
            'password' => 'required|min:6|confirmed',
        ]);

        $response = $this->service->firstAccess($token, $validated['password']);

        return [
            'token' => $response['token'],
            'user' => new CustomerResource($response['customer']),
        ];
    }

    public function me()
    {
        return new CustomerResource(auth('sanctum')->user());
    }

    public function resetPassword(CustomerResetPasswordRequest $request)
    {
        $customer = auth('sanctum')->user();
        
        throw_if(
            !$customer instanceof Customer,
            new UnauthorizedException('Acesso não autorizado')
        );

        throw_if(
            !$customer->should_reset_password,
            new \Exception('Não é necessário redefinir a senha')
        );

        return DB::transaction(function () use ($request, $customer) {
            $this->service->resetPassword($customer, $request->password);
            
            return new CustomerResource($customer->fresh());
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_CUSTOMERS);

        $companyId = app('company')->company()->id;
        return new CustomerCollection($this->service->list($request->all(), $companyId));
    }

    public function show(Customer $customer)
    {
        $this->authorizePermission(Permissions::MANAGE_CUSTOMERS);

        $customer->load('conversationContext');

        return new CustomerResource($customer);
    }

    public function update(Customer $customer, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_CUSTOMERS);
        
        return DB::transaction(function () use ($request, $customer) {
            return new CustomerResource($this->service->update($customer, $request->all()));
        });
    }

    public function destroy(Customer $customer)
    {
        $this->authorizePermission(Permissions::MANAGE_CUSTOMERS);

        $this->service->delete($customer);
    }

    public function updateContext(Request $request, string $identifier)
    {
        $validated = $request->validate([
            'context' => 'required|string',
        ]);

        $customer = $this->service->updateContext($identifier, $validated['context'], 0);

        return new CustomerResource($customer);
    }

    public function getContext(string $identifier)
    {
        $context = $this->service->getContextByIdentifier($identifier, 0);

        return [
            'identifier' => $identifier,
            'context' => $context ?? '',
        ];
    }

    public function updateNotes(Customer $customer, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_CUSTOMERS);

        $validated = $request->validate([
            'notes' => 'required|string',
        ]);

        return DB::transaction(function () use ($customer, $validated) {
            return new CustomerResource($this->service->updateNotes($customer, $validated['notes']));
        });
    }
}
