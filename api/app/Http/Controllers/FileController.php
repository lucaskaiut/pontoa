<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileStoreRequest;
use App\Http\Resources\FileCollection;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FileController extends Controller
{
    protected FileService $service;

    public function __construct(FileService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return response()->json(new FileCollection($this->service->paginate($request->all())));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FileStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            return response()->json(new FileResource($this->service->create($request->validated())), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(File $file)
    {
        return response()->json(new FileResource($file));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, File $file)
    {
        return DB::transaction(function () use ($request, $file) {
            return response()->json(new FileResource($this->service->update($file, $request->all())));
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file)
    {
        $this->service->delete($file);

        return response()->json();
    }
}
