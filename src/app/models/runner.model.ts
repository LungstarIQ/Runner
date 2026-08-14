import { LocationModel } from './location.model';

export type TransportMode = 'WALK' | 'BICYCLE' | 'MOTORBIKE' | 'CAR';

export interface RunnerModel {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  transportMode: TransportMode;
  rating: number; // starts at 5.0, recomputed after each review
  bankAccountId: string;
  location?: LocationModel; // read-only -- not set via create
  createdAt: string;
}

// Required: fullName, email, transportMode.
export interface CreateRunnerRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  transportMode: TransportMode;
}