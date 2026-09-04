export interface AccessToken {
  id: number;
  uuid: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  ip: string;
  user_agent: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserModel {
  id: number;
  uuid: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  full_name?: string;
  national_identity_code?: string;
  mobile: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface Blockchain {
  id: number;
  uuid: string;
  native_asset: string;
  title: Record<string, string>;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface WalletAddress {
  id: number;
  uuid: string;
  name: string;
  wallet_address: string;
  webhook_url: string;
  is_active: boolean;
  allocated_at: string | null;
  allocated_to_user_id: number | null;
  blockchain: Blockchain;
  blockchain_id: number;
  created_at: string;
}

export interface Deposit {
  id: number;
  uuid: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  fee: number;
  confirmations: number;
  status: "detected" | "confirmed";
  block_number: number;
  paid_at: string | null;
  blockchain: Blockchain;
  created_at: string;
}

export interface PaymentRequest {
  id: number;
  uuid: string;
  user_id: number;
  blockchain: Blockchain;
  blockchain_id: number;
  requested_count: number;
  expected_amount: number | null;
  status: "pending" | "confirmed" | "expired";
  expires_at: string | null;
  confirmed_at: string | null;
  wallet_addresses: WalletAddress[];
  deposits: Deposit[];
  created_at: string;
}

export interface NotificationItem {
  id: number;
  uuid: string;
  type: "payment_confirmed" | "payment_expired";
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
