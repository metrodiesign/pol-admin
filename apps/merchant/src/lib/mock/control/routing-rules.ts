import type { RoutingRule } from "@/types/control/routing-rule";

// UI-only, ไม่มี endpoint รองรับ — pol-core ไม่มี routing-rule read endpoint เลย
// ต้องมี endpoint นี้ก่อนถึงจะ align ได้ (REQ-7.2).
// Deterministic seed — ordered by priority within each merchant. Lower priority
// numbers take precedence; one rule intentionally has `enabled: false`.
export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "RR-VPRV-CARD-HI",
    priority: 1,
    merchantId: "vprivilege",
    channel: "card",
    minAmount: 50000,
    targetPsp: "2c2p",
    fallbackPsp: "omise",
    enabled: true,
  },
  {
    id: "RR-VPRV-CARD-LO",
    priority: 2,
    merchantId: "vprivilege",
    channel: "card",
    maxAmount: 49999,
    targetPsp: "omise",
    fallbackPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-VPRV-INSTALLMENT",
    priority: 3,
    merchantId: "vprivilege",
    channel: "installment",
    minAmount: 3000,
    targetPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-VPRV-ANY",
    priority: 9,
    merchantId: "vprivilege",
    channel: "any",
    targetPsp: "omise",
    enabled: true,
  },
  {
    id: "RR-VCOM-CARD",
    priority: 1,
    merchantId: "vcommerce",
    channel: "card",
    targetPsp: "omise",
    fallbackPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-VCOM-PROMPTPAY",
    priority: 2,
    merchantId: "vcommerce",
    channel: "promptpay",
    targetPsp: "omise",
    enabled: false,
  },
  {
    id: "RR-VSVN-PROMPTPAY",
    priority: 1,
    merchantId: "vsouvenir",
    channel: "promptpay",
    maxAmount: 20000,
    targetPsp: "2c2p",
    enabled: true,
  },
  {
    id: "RR-VSVN-ANY",
    priority: 5,
    merchantId: "vsouvenir",
    channel: "any",
    targetPsp: "2c2p",
    fallbackPsp: "omise",
    enabled: true,
  },
];
