export interface ReviewModel {
  id: string;
  errandId: string;
  rating: number; // 1-5
  comment: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}