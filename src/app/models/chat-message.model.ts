export interface ChatMessage {
  id: string;
  errandId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
}