<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Requests\SettingStoreRequest;
use App\Models\Customer;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    protected SettingService $service;

    public function __construct(SettingService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $filters = [];

        if (!$user || $user instanceof Customer) {
            $filters['isPublic'] = true;
        }

        return response()->json([
            'data' => $this->service->list($filters)
        ]);
    }

    public function store(SettingStoreRequest $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user || !($user instanceof User)) {
            throw new HttpResponseException(
                response()->json(['message' => 'Acesso negado.'], 403)
            );
        }

        $this->authorizePermission(Permissions::MANAGE_SETTINGS);

        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $savedSettings = [];

            foreach ($validated as $key => $value) {
                $setting = $this->service->save($key, $value);
                $savedSettings[$setting->key] = $setting->value;
            }

            return response()->json($savedSettings, 201);
        });
    }
}

