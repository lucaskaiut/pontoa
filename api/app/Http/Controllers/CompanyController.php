<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Requests\ChangePlanRequest;
use App\Http\Requests\CompanyStoreRequest;
use App\Http\Requests\UpdateCreditCardRequest;
use App\Http\Requests\UpdateFreePeriodRequest;
use App\Http\Requests\WhatsAppConfigRequest;
use App\Http\Resources\CardCollection;
use App\Http\Resources\CompanyCollection;
use App\Http\Resources\CompanyRecurrencyCollection;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Services\CompanyService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    private CompanyService $companyService;

    private WhatsAppService $whatsAppService;

    public function __construct(CompanyService $companyService, WhatsAppService $whatsAppService)
    {
        $this->companyService = $companyService;
        $this->whatsAppService = $whatsAppService;
    }

    public function index(Request $request)
    {
        return new CompanyCollection($this->companyService->findBy($request->all()));
    }

    public function store(CompanyStoreRequest $request)
    {
        $user = Auth::user();

        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Acesso negado: Apenas superadmins podem criar companies',
            ], 403);
        }

        return DB::transaction(function () use ($request, $user) {
            $data = $request->validated();
            $data['parent_id'] = $user->company_id;
            $data['active'] = $data['active'] ?? true;
            $data['is_free'] = true;

            $company = $this->companyService->create($data);

            app('company')->registerCompany($company);

            return response()->json([
                'message' => 'Company criada com sucesso',
                'data' => new CompanyResource($company),
            ], 201);
        });
    }

    public function me()
    {
        return new CompanyResource(app('company')->company());
    }

    public function show(Company $company)
    {
        $user = Auth::guard('sanctum')->user();

        if ($user->type === 'superadmin') {
            if ($company->parent_id !== $user->company_id) {
                return response()->json([
                    'message' => 'Acesso negado: Company não é filha da company do superadmin',
                ], 403);
            }
        } else {
            $currentCompany = app('company')->company();
            if ($company->id !== $currentCompany->id) {
                return response()->json([
                    'message' => 'Acesso negado: Você só pode visualizar sua própria company',
                ], 403);
            }
        }

        return new CompanyResource($company);
    }

    public function recurrencies(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_PAYMENTS);

        return new CompanyRecurrencyCollection($this->companyService->recurrencies($request->all()));
    }

    public function update(Company $company, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        $user = Auth::guard('sanctum')->user();

        if ($user->type === 'superadmin') {
            if ($company->parent_id !== $user->company_id) {
                return response()->json([
                    'message' => 'Acesso negado: Company não é filha da company do superadmin',
                ], 403);
            }
        } else {
            $currentCompany = app('company')->company();
            if ($company->id !== $currentCompany->id) {
                return response()->json([
                    'message' => 'Acesso negado: Você só pode atualizar sua própria company',
                ], 403);
            }
        }

        return DB::transaction(function () use ($company, $request) {
            return new CompanyResource($this->companyService->update($company, $request->all()));
        });
    }

    public function configureWhatsApp(WhatsAppConfigRequest $request)
    {
        $company = app('company')->company();

        return DB::transaction(function () use ($company) {
            $result = $this->whatsAppService->createInstance($company);
            $qrCode = $this->whatsAppService->getQrCode($company);
            $connectionStatus = $this->whatsAppService->getConnectionStatus($company);

            return response()->json([
                'message' => 'WhatsApp configurado com sucesso',
                'data' => [
                    'instance_name' => $result['instance_name'],
                    'qrcode' => $qrCode,
                    'connection_status' => $connectionStatus,
                ],
            ], 201);
        });
    }

    public function getWhatsAppQrCode()
    {
        $company = app('company')->company();
        $qrCode = $this->whatsAppService->getQrCode($company);
        $connectionStatus = $this->whatsAppService->getConnectionStatus($company);

        return response()->json([
            'qrcode' => $qrCode,
            'connection_status' => $connectionStatus,
        ]);
    }

    public function getWhatsAppConnectionStatus()
    {
        $company = app('company')->company();
        $connectionStatus = $this->whatsAppService->getConnectionStatus($company);

        return response()->json($connectionStatus);
    }

    public function completeOnboarding()
    {
        $company = app('company')->company();

        return DB::transaction(function () use ($company) {
            $company->update(['onboarding_completed' => true]);

            return response()->json([
                'message' => 'Onboarding completed successfully',
                'data' => new CompanyResource($company),
            ]);
        });
    }

    public function calculatePlanChange(ChangePlanRequest $request)
    {
        $user = Auth::guard('sanctum')->user();
        $company = app('company')->company();

        if ($request->has('company_id') && $user->type === 'superadmin') {
            $targetCompany = Company::find($request->company_id);

            if (! $targetCompany) {
                return response()->json([
                    'message' => 'Company não encontrada',
                ], 404);
            }

            if ($targetCompany->parent_id !== $user->company_id) {
                return response()->json([
                    'message' => 'Acesso negado: Company não é filha da company do superadmin',
                ], 403);
            }

            $company = $targetCompany;
            app('company')->registerCompany($company);
        }

        $calculation = $this->companyService->calculatePlanChange(
            $company,
            $request->plan_type,
            $request->recurrence_type
        );

        return response()->json([
            'data' => $calculation,
        ]);
    }

    public function changePlan(ChangePlanRequest $request)
    {
        $user = Auth::guard('sanctum')->user();
        $company = app('company')->company();

        if ($request->has('company_id') && $user->type === 'superadmin') {
            $targetCompany = Company::find($request->company_id);

            if (! $targetCompany) {
                return response()->json([
                    'message' => 'Company não encontrada',
                ], 404);
            }

            if ($targetCompany->parent_id !== $user->company_id) {
                return response()->json([
                    'message' => 'Acesso negado: Company não é filha da company do superadmin',
                ], 403);
            }

            $company = $targetCompany;
            app('company')->registerCompany($company);
        }

        return DB::transaction(function () use ($company, $request) {
            if ($request->has('card_id')) {
                $card = $company->cards()->where('id', $request->card_id)->first();
                if (! $card) {
                    return response()->json([
                        'message' => 'Cartão não encontrado ou não pertence à sua empresa',
                    ], 404);
                }
                $company->update(['card_id' => $request->card_id]);
                $company->refresh();
            }

            $creditCardData = $request->has('credit_card') ? $request->credit_card : null;

            $updatedCompany = $this->companyService->changePlan(
                $company,
                $request->plan_type,
                $request->recurrence_type,
                $creditCardData
            );

            return response()->json([
                'message' => 'Plano alterado com sucesso',
                'data' => new CompanyResource($updatedCompany),
            ]);
        });
    }

    public function updateCreditCard(UpdateCreditCardRequest $request)
    {
        $company = app('company')->company();

        return DB::transaction(function () use ($company, $request) {
            $updatedCompany = $this->companyService->updateCreditCard(
                $company,
                $request->validated()
            );

            return response()->json([
                'message' => 'Cartão de crédito atualizado com sucesso',
                'data' => new CompanyResource($updatedCompany),
            ]);
        });
    }

    public function cards()
    {
        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        $company = app('company')->company();

        return new CardCollection($company->cards()->get());
    }

    public function cancelSubscription()
    {
        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        $company = app('company')->company();

        return DB::transaction(function () use ($company) {
            $updatedCompany = $this->companyService->cancelSubscription($company);

            return response()->json([
                'message' => 'Assinatura cancelada com sucesso. Você terá acesso até o fim do período pago.',
                'data' => new CompanyResource($updatedCompany),
            ]);
        });
    }

    public function reactivateSubscription()
    {
        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        $company = app('company')->company();

        return DB::transaction(function () use ($company) {
            $updatedCompany = $this->companyService->reactivateSubscription($company);

            return response()->json([
                'message' => 'Assinatura reativada com sucesso',
                'data' => new CompanyResource($updatedCompany),
            ]);
        });
    }

    public function setActiveCard(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        $company = app('company')->company();

        $request->validate([
            'card_id' => 'required|exists:cards,id',
        ]);

        return DB::transaction(function () use ($company, $request) {
            $card = $company->cards()->where('id', $request->card_id)->first();

            if (! $card) {
                return response()->json([
                    'message' => 'Cartão não encontrado ou não pertence à sua empresa',
                ], 404);
            }

            $company->update(['card_id' => $request->card_id]);

            return response()->json([
                'message' => 'Cartão ativo atualizado com sucesso',
                'data' => new CompanyResource($company->fresh()),
            ]);
        });
    }

    public function updateFreePeriod(Company $company, UpdateFreePeriodRequest $request)
    {
        $user = Auth::user();

        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Acesso negado: Apenas superadmins podem atualizar o período grátis',
            ], 403);
        }

        if ($company->parent_id !== $user->company_id && $company->id !== $user->company_id) {
            return response()->json([
                'message' => 'Acesso negado: Company não é filha da company do superadmin',
            ], 403);
        }

        return DB::transaction(function () use ($company, $request) {
            $data = $request->validated();

            if (isset($data['current_period_end']) && $data['current_period_end']) {
                $data['current_period_end'] = \Carbon\Carbon::parse($data['current_period_end'])->format('Y-m-d H:i:s');
            } else {
                $data['current_period_end'] = null;
            }

            if ($data['is_free'] && ! isset($data['current_period_end'])) {
                return response()->json([
                    'message' => 'O campo current_period_end é obrigatório quando is_free é verdadeiro',
                ], 422);
            }

            $company->update($data);

            return response()->json([
                'message' => 'Período grátis atualizado com sucesso',
                'data' => new CompanyResource($company->fresh()),
            ]);
        });
    }
}
