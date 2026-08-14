export interface CustomerModel {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bankAccountId: string;
  createdAt: string;
}
 
// Required: fullName, email. id/bankAccountId/createdAt are server-generated
// -- sending them is harmless but ignored.
export interface CreateCustomerRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
}