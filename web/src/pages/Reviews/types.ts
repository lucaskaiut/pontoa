export interface Review {
  id?: string | number;
  company_id: string | number;
  appointment_id: string | number;
  customer_id: string | number;
  score: number;
  comment?: string | null;
  classification: 'promoter' | 'neutral' | 'detractor';
  is_public: boolean;
  sent_to_google: boolean;
  created_at?: string;
  updated_at?: string;
  customer?: {
    name: string;
  };
  appointment?: {
    id: string | number;
    date: string;
  };
}

export interface ReviewSettings {
  google_review_link?: string | null;
  min_score_to_redirect: number;
}

