import type { PaymentChannel } from "./transaction";

export interface PspConfig {
  id: string;
  name: string;
  label: string;
  live: boolean;
  primary: boolean;
  channels: PaymentChannel[];
  todayTxn: number;
  todayVolume: number;
  successRate: number;
  fees: string;
  settlement: string;
  merchantId: string;
  apiKey: string;
}

export interface PspRoutingRule {
  id: number;
  priority: number;
  name: string;
  enabled: boolean;
  when: string;
  then: string;
  label: string;
}
