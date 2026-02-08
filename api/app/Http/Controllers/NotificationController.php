<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Requests\NotificationStoreRequest;
use App\Http\Resources\NotificationCollection;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    private NotificationService $service;

    public function __construct(NotificationService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_NOTIFICATIONS);

        return new NotificationCollection($this->service->list($request->all()));
    }

    public function store(NotificationStoreRequest $request)
    {
        $this->authorizePermission(Permissions::MANAGE_NOTIFICATIONS);

        return DB::transaction(function () use ($request) {
            $notification = $this->service->create($request->all());

            return new NotificationResource($notification);
        });
    }

    public function show(Notification $notification)
    {
        $this->authorizePermission(Permissions::MANAGE_NOTIFICATIONS);

        return new NotificationResource($notification);
    }

    public function update(Request $request, Notification $notification)
    {
        $this->authorizePermission(Permissions::MANAGE_NOTIFICATIONS);

        return DB::transaction(function () use ($request, $notification) {
            return new NotificationResource($this->service->update($notification, $request->all()));
        });
    }

    public function destroy(Notification $notification)
    {
        $this->authorizePermission(Permissions::MANAGE_NOTIFICATIONS);

        $this->service->delete($notification);
    }
}

