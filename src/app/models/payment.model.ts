export type PaymentMethod = 'CASH' | 'SNAPSCAN' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
  paymentId: string;
  errandId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
}