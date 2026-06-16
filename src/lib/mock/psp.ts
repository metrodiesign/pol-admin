import type { PspConfig, PspRoutingRule } from "@/types/psp";

export const PSP_CONFIGS: PspConfig[] = [
  {
    id: "2c2p",
    name: "2C2P",
    label: "2C2P PayPlus",
    live: true,
    primary: true,
    channels: ["card", "qr", "installment"],
    todayTxn: 1842,
    todayVolume: 12480500,
    successRate: 98.7,
    fees: "บัตร 2.5% / QR 0.8% / ผ่อน 3.2%",
    settlement: "T+2",
    merchantId: "JT-2C2P-MAIN-001",
    apiKey: "sk_live_2c2p_••••••••••••3a91",
  },
  {
    id: "omise",
    name: "Omise",
    label: "Omise Payments",
    live: true,
    primary: false,
    channels: ["card", "qr", "wallet"],
    todayTxn: 624,
    todayVolume: 4108200,
    successRate: 97.9,
    fees: "บัตร 3.65% / QR 1.0% / Wallet 2.95%",
    settlement: "T+3",
    merchantId: "OMS-INSURE-MAIN-001",
    apiKey: "sk_live_omise_••••••••••••8d27",
  },
];

export const PSP_ROUTING_RULES: PspRoutingRule[] = [
  { id: 1, priority: 1, name: "ผ่อนชำระ → 2C2P เท่านั้น", enabled: true, when: "ช่องทาง = ผ่อนชำระ", then: "2C2P", label: "รับเฉพาะ 2C2P" },
  { id: 2, priority: 2, name: "ยอดสูง → 2C2P (เครดิต)", enabled: true, when: "ช่องทาง = บัตร AND ยอด ≥ ฿50,000", then: "2C2P", label: "อัตราค่าธรรมเนียมต่ำกว่า" },
  { id: 3, priority: 3, name: "QR PromptPay → Omise", enabled: true, when: "ช่องทาง = QR PromptPay", then: "Omise", label: "Success rate สูงกว่า" },
  { id: 4, priority: 4, name: "Default → 2C2P", enabled: true, when: "อื่นๆ ทั้งหมด", then: "2C2P", label: "PSP หลัก" },
];
