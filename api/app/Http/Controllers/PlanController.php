<?php

namespace App\Http\Controllers;

use App\Services\PlanService;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    private PlanService $planService;

    public function __construct(PlanService $planService)
    {
        $this->planService = $planService;
    }

    /**
     * Get all available plans
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $plans = $this->planService->getAllPlans();

        $plansArray = array_map(function ($plan) {
            return $plan->toArray();
        }, $plans);

        return response()->json([
            'data' => $plansArray,
        ]);
    }
}

