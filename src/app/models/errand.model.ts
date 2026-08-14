import { LocationModel } from './location.model';

export type ErrandStatus =
  | 'POSTED'
  | 'CLAIMED'
  | 'RUNNER_EN_ROUTE_TO_PICKUP'
  | 'PICKUP_CONFIRMED'
  | 'RUNNER_EN_ROUTE_TO_DELIVERY'
  | 'DELIVERED'
  | 'AWAITING_PAYMENT'
  | 'PROCESSING_PAYMENT'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'DISPUTED';

// Only the events this app is ever allowed to send. PAYMENT_SUCCESS /
// PAYMENT_FAILURE are fired internally by the async payment consumer and
// should never appear in a request from here.
export type ErrandEvent =
  | 'CLAIM'
  | 'START_PICKUP'
  | 'CONFIRM_PICKUP'
  | 'START_DELIVERY'
  | 'CONFIRM_DELIVERY'
  | 'INITIATE_PAYMENT'
  | 'CANCEL'
  | 'DISPUTE'
  | 'RETRY_PAYMENT';

export interface ErrandModel {
  id: string;
  customerId: string;
  runnerId?: string; // null until claimed
  description: string;
  category: string; // free text server-side -- see shared/constants.ts note
  payoutAmount: number;
  status: ErrandStatus;
  pickupLocation: LocationModel;
  dropoffLocation: LocationModel;
  createdAt: string;
}

// Required: description, payoutAmount, pickupLocation, dropoffLocation.
// customerId is deliberately NOT here -- POST /errands takes it as a query
// param, not part of the body.
export interface CreateErrandRequest {
  description: string;
  category?: string;
  payoutAmount: number;
  pickupLocation: LocationModel;
  dropoffLocation: LocationModel;
}