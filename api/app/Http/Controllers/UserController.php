<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\UserRegisterRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Jobs\UpdateBankAccountJob;
use App\Models\User;
use App\Services\RegisterService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    private UserService $service;

    private RegisterService $registerService;

    public function __construct(UserService $service, RegisterService $registerService)
    {
        $this->service = $service;
        $this->registerService = $registerService;
    }

    public function register(UserRegisterRequest $request)
    {
        $user = $this->registerService->handle($request->validated());

        return new UserResource($user);
    }

    public function login(UserLoginRequest $request)
    {
        $response = $this->service->login($request->all());

        return [
            'token' => $response['token'],
            'user' => new UserResource($response['user']),
        ];
    }

    public function me()
    {
        $user = auth('sanctum')->user();
        $user->load(['schedules', 'services']);

        return new UserResource($user);
    }

    public function bank(User $user, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        return DB::transaction(function () use ($user, $request) {
            $this->service->update($user, $request->all());

            UpdateBankAccountJob::dispatch($user);

            return new UserResource($user);
        });
    }

    public function store(UserStoreRequest $request)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        return DB::transaction(function () use ($request) {
            $company = app('company')->company;

            $data = $request->all();

            $data['company_id'] = $company->id;

            $user = $this->service->create($data);

            return new UserResource($user);
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        $request->merge(['type' => 'admin']);

        $users = $this->service->list($request->all());

        return new UserCollection($users);
    }

    public function collaborators(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        $filters = $request->all();
        $filters['type'] = 'admin';
        $filters['isCollaborator'] = true;
        $users = $this->service->list($filters);

        return new UserCollection($users);
    }

    public function show($id)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        $user = $this->service->findOrFail($id);

        return new UserResource($user);
    }

    public function update(User $user, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        return DB::transaction(function () use ($user, $request) {
            $this->service->update($user, $request->all());

            return new UserResource($user);
        });
    }

    public function destroy(User $user)
    {
        $this->authorizePermission(Permissions::MANAGE_USERS);

        return DB::transaction(function () use ($user) {
            $this->service->delete($user);

            return response()->json([], 200);
        });
    }
}
