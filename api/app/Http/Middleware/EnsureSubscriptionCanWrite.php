<?php

namespace App\Http\Middleware;

use App\Services\CompanyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionCanWrite
{
    protected array $exemptRoutes = [
        'companies.me',
        'companies.index',
        'companies.store',
        'companies.calculate-plan-change',
        'companies.change-plan',
        'companies.update-credit-card',
        'companies.cancel-subscription',
        'companies.reactivate-subscription',
        'companies.set-active-card',
        'companies.cards.index',
        'companies.show',
        'companies.update',
        'payments.createToken',
        'plans.index',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();

        if ($routeName && in_array($routeName, $this->exemptRoutes)) {
            return $next($request);
        }

        $company = app('company')->company();

        if (! $company) {
            return response()->json([
                'message' => 'Empresa não encontrada',
            ], 404);
        }

        if (! $company->active) {
            return response()->json([
                'message' => 'Sua empresa está inativa. Entre em contato com o suporte para mais informações.',
            ], 403);
        }

        $companyService = app(CompanyService::class);

        if (! $companyService->canWrite($company)) {
            return response()->json([
                'message' => 'Sua assinatura expirou. Renove seu plano para continuar usando o sistema.',
            ], 403);
        }

        return $next($request);
    }
}
