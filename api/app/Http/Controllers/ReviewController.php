<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\ReviewCollection;
use App\Http\Resources\ReviewResource;
use App\Http\Requests\ReviewStoreRequest;
use App\Models\Customer;
use App\Models\Review;
use App\Services\ReviewService;
use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\UnauthorizedException;

class ReviewController extends Controller
{
    private ReviewService $service;

    public function __construct(ReviewService $service)
    {
        $this->service = $service;
    }

    public function store(ReviewStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $company = app('company')->company();
            $scheduling = \App\Models\Scheduling::findOrFail($request->appointment_id);

            $data = array_merge($request->validated(), [
                'company_id' => $company->id,
                'customer_id' => $scheduling->customer_id,
            ]);

            $review = $this->service->create($data);
            $reviewResource = new ReviewResource($review);

            $settingService = app(SettingService::class);
            $googleReviewLink = $settingService->get('google_review_link');
            $minScoreToRedirect = (int) ($settingService->get('min_score_to_redirect') ?? 9);

            $responseData = $reviewResource->toArray($request);
            
            if ($review->score >= $minScoreToRedirect && $googleReviewLink) {
                $responseData['google_review_link'] = $googleReviewLink;
            }

            return response()->json($responseData, 201);
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        return new ReviewCollection($this->service->list($request->all()));
    }

    public function myReviews(Request $request)
    {
        $customer = auth('sanctum')->user();

        if (!$customer || !($customer instanceof Customer)) {
            return response()->json(['message' => 'Não autorizado'], 401);
        }

        $reviews = $this->service->listByCustomer($customer->id);

        return response()->json(ReviewResource::collection($reviews));
    }

    public function public(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $reviews = $this->service->listPublic($request->all());

        $reviews->each(function ($review) {
            if ($review->customer) {
                $review->customer->makeHidden(['id', 'email', 'phone', 'document', 'identifier', 'context']);
            }
        });

        return response()->json(ReviewResource::collection($reviews));
    }

    public function show(Review $review)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        return new ReviewResource($review);
    }

    public function update(Request $request, Review $review)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        $request->validate([
            'score' => 'sometimes|integer|min:0|max:10',
            'comment' => 'sometimes|nullable|string|max:1000',
            'is_public' => 'sometimes|boolean',
        ]);

        return DB::transaction(function () use ($request, $review) {
            return new ReviewResource($this->service->update($review, $request->all()));
        });
    }

    public function destroy(Review $review)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        $this->service->delete($review);

        return response()->json();
    }
}
