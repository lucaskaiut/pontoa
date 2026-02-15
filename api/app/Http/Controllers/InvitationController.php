<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitationRegisterRequest;
use App\Http\Requests\InvitationStoreRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Resources\InvitationCollection;
use App\Http\Resources\InvitationResource;
use App\Http\Resources\UserResource;
use App\Models\Invitation;
use App\Services\InvitationService;
use Illuminate\Support\Facades\DB;

class InvitationController extends Controller
{
    private InvitationService $service;

    public function __construct(InvitationService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return new InvitationCollection($this->service->list());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(InvitationStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->all();
        
            $data['user_id'] = auth()->user()->id;

            $data['company_id'] = app('company')->company->id;

            return new InvitationResource($this->service->create($data));
        });
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Invitation  $invitation
     * @return \Illuminate\Http\Response
     */
    public function show(Invitation $invitation)
    {
        return new InvitationResource($invitation);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Invitation  $invitation
     * @return \Illuminate\Http\Response
     */
    public function destroy(Invitation $invitation)
    {
        $this->service->delete($invitation);
    }

    public function register($token, InvitationRegisterRequest $request)
    {
        return DB::transaction(function () use ($token, $request) {
            $user = $this->service->register($token, $request->all());

            return new UserResource($user);
        });
    }
}
