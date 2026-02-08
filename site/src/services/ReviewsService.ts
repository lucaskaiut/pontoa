import { BaseService } from "./BaseService";
import api from "./api";

export interface Review {
  id: number;
  appointment_id: number;
  score: number;
  comment?: string | null;
  classification: "promoter" | "neutral" | "detractor";
  is_public: boolean;
  created_at: string;
  google_review_link?: string;
  appointment?: {
    id: number;
    date: string;
    service?: {
      id: number;
      name: string;
    };
    user?: {
      id: number;
      name: string;
    };
  };
  customer?: {
    name: string;
  };
}

export interface CreateReviewPayload {
  appointment_id: number;
  score: number;
  comment?: string;
}

class ReviewsServiceClass extends BaseService {
  constructor() {
    super("/reviews");
  }

  async createReview(data: CreateReviewPayload): Promise<Review> {
    const response = await api.post<Review>(this.baseEndpoint, data);
    return response.data;
  }

  async getPublicReviews(companyId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`${this.baseEndpoint}/public`, {
      params: { company_id: companyId },
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  async getMyReviews(): Promise<Review[]> {
    const response = await api.get<Review[]>(`${this.baseEndpoint}/my-reviews`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }
}

export const ReviewsService = new ReviewsServiceClass();

