export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ERRAND_PAYMENT' | 'REFUND';

export interface TransactionModel {
  id: string;
  errandId: string;
  senderAccountId: string;
  receiverAccountId: string;
  amount: number;
  type: TransactionType;
  createdAt: string;
}