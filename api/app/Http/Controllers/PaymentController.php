<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentCreateTokenRequest;
use App\Services\Payments\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function createToken(PaymentCreateTokenRequest $request): JsonResponse
    {
        $token = $this->paymentService->createToken(
            $request->validated()['method'],
            $request->validated()
        );

        return response()->json([
            'token' => $token,
        ]);
    }
}
