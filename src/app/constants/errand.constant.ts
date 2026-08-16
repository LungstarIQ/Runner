
import { ErrandStatus, ErrandEvent } from '../models/errand.model';
 
// The "trunk" of the FSM -- the happy-path sequence an errand moves through.
// CANCELLED / DISPUTED / PAYMENT_FAILED are branches off this, not steps on
// it, so they're deliberately left out here -- a progress tracker should
// treat them as a separate "derailed" state, not a position on this line.
export const ERRAND_STATUS_ORDER: ErrandStatus[] = [
  'POSTED',
  'CLAIMED',
  'RUNNER_EN_ROUTE_TO_PICKUP',
  'PICKUP_CONFIRMED',
  'RUNNER_EN_ROUTE_TO_DELIVERY',
  'DELIVERED',
  'AWAITING_PAYMENT',
  'PROCESSING_PAYMENT',
  'COMPLETED',
];
 
export const ERRAND_STATUS_LABELS: Record<ErrandStatus, string> = {
  POSTED: 'Posted',
  CLAIMED: 'Claimed',
  RUNNER_EN_ROUTE_TO_PICKUP: 'Runner en route to pickup',
  PICKUP_CONFIRMED: 'Pickup confirmed',
  RUNNER_EN_ROUTE_TO_DELIVERY: 'Runner en route to delivery',
  DELIVERED: 'Delivered',
  AWAITING_PAYMENT: 'Awaiting payment',
  PROCESSING_PAYMENT: 'Processing payment',
  COMPLETED: 'Completed',
  PAYMENT_FAILED: 'Payment failed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};
 
// The event that advances a given status along the frontend's happy path --
// drives the tracker's single primary action button (e.g. while status is
// CLAIMED, the button fires START_PICKUP). Statuses with no entry here
// (COMPLETED, CANCELLED, DISPUTED) are terminal or need a non-"next step"
// action (refund, dispute) instead of a single forward event.
export const NEXT_EVENT_FOR_STATUS: Partial<Record<ErrandStatus, ErrandEvent>> = {
  POSTED: 'CLAIM',
  CLAIMED: 'START_PICKUP',
  RUNNER_EN_ROUTE_TO_PICKUP: 'CONFIRM_PICKUP',
  PICKUP_CONFIRMED: 'START_DELIVERY',
  RUNNER_EN_ROUTE_TO_DELIVERY: 'CONFIRM_DELIVERY',
  DELIVERED: 'INITIATE_PAYMENT',
  AWAITING_PAYMENT: 'INITIATE_PAYMENT', // sent twice back-to-back per the backend doc
  PAYMENT_FAILED: 'RETRY_PAYMENT',
};
 
// Which event a "report issue" / cancel action should send, per status --
// the backend table routes this to CANCELLED early on but to DISPUTED once
// a runner has already committed (mid-flight en-route/confirmed states),
// and DELIVERED/PAYMENT_FAILED use a dedicated DISPUTE event instead of
// CANCEL. States not listed here have no cancel/dispute path at all
// (AWAITING_PAYMENT, PROCESSING_PAYMENT, COMPLETED, CANCELLED, DISPUTED)
// -- hide the action entirely for those.
export const CANCEL_EVENT_FOR_STATUS: Partial<Record<ErrandStatus, ErrandEvent>> = {
  POSTED: 'CANCEL',
  CLAIMED: 'CANCEL',
  RUNNER_EN_ROUTE_TO_PICKUP: 'CANCEL',
  PICKUP_CONFIRMED: 'CANCEL',
  RUNNER_EN_ROUTE_TO_DELIVERY: 'CANCEL',
  DELIVERED: 'DISPUTE',
  PAYMENT_FAILED: 'DISPUTE',
};

export const BRANCH_STATUSES: ErrandStatus[] = ['CANCELLED', 'DISPUTED', 'PAYMENT_FAILED'];
 
// UI-only labels for the primary action button -- POSTED is handled as a
// special case in primaryAction() below since claiming hits a different
// endpoint (POST /errands/{id}/claim?runnerId=...) than every other
// transition (POST /errands/{id}/status?event=...).
export const PRIMARY_ACTION_LABELS: Partial<Record<ErrandStatus, string>> = {
  POSTED: 'Claim this errand',
  CLAIMED: 'Start pickup',
  RUNNER_EN_ROUTE_TO_PICKUP: 'Confirm pickup',
  PICKUP_CONFIRMED: 'Start delivery',
  RUNNER_EN_ROUTE_TO_DELIVERY: 'Confirm delivery',
  DELIVERED: 'Initiate payment',
  AWAITING_PAYMENT: 'Initiate payment',
  PAYMENT_FAILED: 'Retry payment',
};
 
// Frontend-only convenience list for the category chips when posting an
// errand -- category is a free-text string on the backend, not an enum, so
// any string is technically valid. This is just what we suggest.
export const ERRAND_CATEGORIES = ['Queues', 'Groceries', 'Parcels', 'Documents', 'Other'] as const;
 
export const TICKET_THEME = {
  ink: '#18140F',
  paper: '#F1EAD9',
  amber: '#E8A23C',
  amberDark: '#8a5a17',
  maroon: '#7A2A1F',
  green: '#2E6B4F',
};