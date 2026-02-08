<?php

namespace App\Services;

use App\Events\ReviewNegativeReceived;
use App\Models\Review;

final class ReviewService
{
    public function create(array $data): Review
    {
        $classification = Review::classifyScore($data['score']);
        
        $reviewData = array_merge($data, [
            'classification' => $classification,
            'is_public' => $classification === 'promoter',
        ]);

        $review = Review::create($reviewData);

        if ($classification === 'detractor' && !empty($data['comment'])) {
            event(new ReviewNegativeReceived($review));
        }

        return $review->load(['company', 'customer', 'appointment']);
    }

    public function list(array $filters = [])
    {
        $query = Review::with(['company', 'customer', 'appointment']);

        if (isset($filters['classification'])) {
            $query->where('classification', $filters['classification']);
        }

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['score', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate();
    }

    public function listByCustomer(int $customerId)
    {
        return Review::with(['appointment.service', 'appointment.user'])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    public function listPublic(array $filters = [])
    {
        $query = Review::with(['customer'])
            ->where('classification', 'promoter')
            ->where('is_public', true);

        if (isset($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        return $query->orderBy('created_at', 'DESC')->get();
    }

    public function findOrFail($id): Review
    {
        return Review::with(['company', 'customer', 'appointment'])->findOrFail($id);
    }

    public function update(Review $review, array $data): Review
    {
        if (isset($data['score'])) {
            $data['classification'] = Review::classifyScore($data['score']);
            $data['is_public'] = $data['classification'] === 'promoter';
        }

        $review->update($data);

        return $review->load(['company', 'customer', 'appointment']);
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}

