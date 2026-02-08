<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Models\User;
use App\Services\CompanyService;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class InitializeCompany
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string|null  ...$guards
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $this->authenticateIfTokenPresent($request);

        $company = $this->company($request);

        throw_if(!$company, new NotFoundHttpException('Loja não encontrada'));

        app('company')->registerCompany($company);

        return $next($request);
    }

    private function authenticateIfTokenPresent(Request $request): void
    {
        if ($request->bearerToken() && !Auth::check()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            
            if ($token && $user = $token->tokenable) {
                Auth::setUser($user);
            }
        }
    }

    private function extractDomainFromRequest(Request $request): ?string
    {
        $domain = $request->header('X-Company-Domain') 
            ?? $request->query('domain')
            ?? $request->headers->get('referer')
            ?? $request->headers->get('origin');

        if (empty($domain)) {
            return null;
        }

        if (str_contains($domain, 'http')) {
            $domainParts = explode('/', $domain);
            $domain = $domainParts[2] ?? $domain;
        }
        
        $domain = str_replace('www.', '', $domain);
        $domain = str_replace('/', '', $domain);

        return $domain ?: null;
    }

    private function company(Request $request): ?Company
    {
        if ($user = Auth::user()) {
            if ($user->type === 'superadmin') {
                $companyId = $request->query('company_id');
                
                if ($companyId) {
                    $childCompany = Company::find($companyId);
                    
                    if (!$childCompany) {
                        throw new NotFoundHttpException('Company não encontrada');
                    }
                    
                    if (!$this->isChildCompany($user->company_id, $childCompany->id)) {
                        throw new AccessDeniedHttpException('Acesso negado: Company não é filha da company do superadmin');
                    }
                    
                    return $childCompany;
                }
            }
            
            return $user->company;
        }

        $domain = $this->extractDomainFromRequest($request);

        if (empty($domain)) {
            return null;
        }

        $company = (new CompanyService())->findOneBy(['domain' => $domain]);

        return $company;
    }

    private function isChildCompany(int $parentCompanyId, int $childCompanyId): bool
    {
        $childCompany = Company::find($childCompanyId);
        
        if (!$childCompany) {
            return false;
        }
        
        return $childCompany->parent_id === $parentCompanyId;
    }
}