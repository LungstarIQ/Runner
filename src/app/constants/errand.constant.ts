import { ErrandStatus, ErrandCategory } from '../models/errand.model';

export const ERRAND_STATUS_ORDER: ErrandStatus[] = [
  'POSTED',
  'CLAIMED',
  'EN_ROUTE',
  'DELIVERED',
];

export const ERRAND_STATUS_LABELS: Record<ErrandStatus, string> = {
  POSTED: 'Posted',
  CLAIMED: 'Claimed',
  EN_ROUTE: 'En route',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

export const CATEGORY_LABELS: Record<ErrandCategory, string> = {
  QUEUES: 'Queues',
  GROCERIES: 'Groceries',
  PARCELS: 'Parcels',
  DOCUMENTS: 'Documents',
  OTHER: 'Other',
};

export const TICKET_THEME = {
  ink: '#18140F',
  paper: '#F1EAD9',
  amber: '#E8A23C',
  amberDark: '#8a5a17',
  maroon: '#7A2A1F',
  green: '#2E6B4F',
};
