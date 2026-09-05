export interface DepositOverTimePoint {
  date: string;
  count: number;
  amount: number;
}

export interface DepositByBlockchain {
  blockchain: string;
  count: number;
  amount: number;
}

export interface DashboardSummary {
  payment_requests_by_status: Record<string, number>;
  allocated_wallets: number;
  total_received_amount: number;
  unread_notifications: number;
  deposits_over_time: DepositOverTimePoint[];
  deposits_by_blockchain: DepositByBlockchain[];
}
