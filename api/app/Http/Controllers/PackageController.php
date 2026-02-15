<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\PackageCollection;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use App\Services\PackageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    private PackageService $packageService;

    public function __construct(PackageService $packageService)
    {
        $this->packageService = $packageService;
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        return new PackageCollection($this->packageService->list($request->all()));
    }

    public function store(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'total_sessions' => 'required|integer|min:1',
            'bonus_sessions' => 'nullable|integer|min:0',
            'expires_in_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'price' => 'nullable|numeric|min:0',
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $package = $this->packageService->create($validated);

            return new PackageResource($package);
        });
    }

    public function show(Package $package)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        return new PackageResource($this->packageService->findOrFail($package->id));
    }

    public function update(Request $request, Package $package)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'total_sessions' => 'sometimes|integer|min:1',
            'bonus_sessions' => 'nullable|integer|min:0',
            'expires_in_days' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'price' => 'nullable|numeric|min:0',
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id',
        ]);

        return DB::transaction(function () use ($package, $validated) {
            $package = $this->packageService->update($package, $validated);

            return new PackageResource($package);
        });
    }

    public function destroy(Package $package)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        DB::transaction(function () use ($package) {
            $this->packageService->delete($package);
        });

        return response()->json(['message' => 'Pacote deletado com sucesso']);
    }

    public function toggleActive(Package $package)
    {
        $this->authorizePermission(Permissions::MANAGE_PACKAGES);

        $package = $this->packageService->toggleActive($package);

        return new PackageResource($package);
    }

    public function available()
    {
        $packages = $this->packageService->listAvailable();

        return response()->json(['data' => $packages]);
    }
}
