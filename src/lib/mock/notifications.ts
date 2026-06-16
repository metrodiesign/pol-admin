export type NotificationType = "sms" | "email";
export type NotificationStatus = "sent" | "queued" | "failed";

export interface NotificationDeliveryDetail {
  attempts: number;
  latency: string;
  provider: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  recipient: string;
  subject: string;
  templateId: string;
  templateName: string;
  body: string;
  status: NotificationStatus;
  sentAt: string;
  orig: string;
  delivery: NotificationDeliveryDetail;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "sms",
    recipient: "081-234-5678",
    subject: "ลิงก์ชำระเบี้ยประกัน PLK-050023",
    templateId: "TPL-SMS-001",
    templateName: "payment_link",
    body: "CentroPay: คลิกลิงก์เพื่อชำระเบี้ยประกัน PLK-050023 จำนวน ฿18,420.00 https://pay.centropay.co.th/p/abcd1234 (หมดอายุ 24 ชม.)",
    status: "sent",
    sentAt: "2026-05-24T14:31:22",
    orig: "AG-118",
    delivery: {
      attempts: 1,
      latency: "312ms",
      provider: "DTAC-SMS",
    },
  },
  {
    id: 2,
    type: "email",
    recipient: "kansuda.p@mail.com",
    subject: "ยืนยันการชำระเงิน TXN-2026-100023",
    templateId: "TPL-EMAIL-003",
    templateName: "payment_confirmation",
    body: "เรียน คุณกานต์สุดา\n\nเราได้รับการชำระเงินเรียบร้อยแล้ว\nรายการ: TXN-2026-100023\nจำนวน: ฿18,420.00\nช่องทาง: บัตรเครดิต\nวันที่: 24 พ.ค. 2569\n\nขอบคุณที่ใช้บริการ CentroPay",
    status: "sent",
    sentAt: "2026-05-24T14:31:18",
    orig: "BR-001",
    delivery: {
      attempts: 1,
      latency: "1,240ms",
      provider: "SendGrid",
    },
  },
  {
    id: 3,
    type: "sms",
    recipient: "092-441-7820",
    subject: "แจ้งเตือนเบี้ยใกล้หมดอายุ",
    templateId: "TPL-SMS-004",
    templateName: "premium_due_reminder",
    body: "CentroPay: เบี้ยประกัน POL-2415088 ครบกำหนด 30 พ.ค. 2569 จำนวน ฿9,840.00 กรุณาชำระก่อนหมดอายุ",
    status: "queued",
    sentAt: "2026-05-24T14:30:00",
    orig: "AP-002",
    delivery: {
      attempts: 0,
      latency: "—",
      provider: "AIS-SMS",
    },
  },
  {
    id: 4,
    type: "email",
    recipient: "ritthirong.p@mail.com",
    subject: "ใบเสร็จรับเงิน RC-2026-008812",
    templateId: "TPL-EMAIL-005",
    templateName: "receipt",
    body: "เรียน คุณฤทธิรงค์\n\nแนบไฟล์ใบเสร็จรับเงิน RC-2026-008812\nจำนวน ฿32,800.00\nวันที่ชำระ: 24 พ.ค. 2569\n\nขอบคุณที่ไว้วางใจ CentroPay",
    status: "sent",
    sentAt: "2026-05-24T14:28:11",
    orig: "BR-001",
    delivery: {
      attempts: 1,
      latency: "998ms",
      provider: "SendGrid",
    },
  },
  {
    id: 5,
    type: "sms",
    recipient: "085-117-2398",
    subject: "ลิงก์ชำระเบี้ยประกัน PLK-050021",
    templateId: "TPL-SMS-001",
    templateName: "payment_link",
    body: "CentroPay: คลิกลิงก์เพื่อชำระเบี้ยประกัน PLK-050021 จำนวน ฿12,600.00 https://pay.centropay.co.th/p/xyz9876 (หมดอายุ 24 ชม.)",
    status: "failed",
    sentAt: "2026-05-24T14:25:47",
    orig: "BK-007",
    delivery: {
      attempts: 3,
      latency: "timeout",
      provider: "TRUE-SMS",
      errorCode: "ERR_TIMEOUT",
      errorMessage: "SMS gateway timeout after 3 attempts",
    },
  },
  {
    id: 6,
    type: "email",
    recipient: "patsakorn.a@mail.com",
    subject: "การชำระเงินไม่สำเร็จ TXN-2026-100020",
    templateId: "TPL-EMAIL-007",
    templateName: "payment_failed",
    body: "เรียน คุณพัสกร\n\nการชำระเงิน TXN-2026-100020 ไม่สำเร็จ\nเหตุผล: บัตรถูกปฏิเสธ\nกรุณาลองใหม่อีกครั้งหรือใช้ช่องทางอื่น",
    status: "sent",
    sentAt: "2026-05-24T14:22:00",
    orig: "AG-204",
    delivery: {
      attempts: 1,
      latency: "876ms",
      provider: "SendGrid",
    },
  },
  {
    id: 7,
    type: "sms",
    recipient: "094-223-1109",
    subject: "ยืนยัน OTP การชำระเงิน",
    templateId: "TPL-SMS-002",
    templateName: "otp",
    body: "CentroPay: รหัส OTP ของท่านคือ 847291 (หมดอายุใน 5 นาที) อย่าเปิดเผยรหัสนี้",
    status: "sent",
    sentAt: "2026-05-24T14:18:33",
    orig: "AP-001",
    delivery: {
      attempts: 1,
      latency: "218ms",
      provider: "AIS-SMS",
    },
  },
  {
    id: 8,
    type: "email",
    recipient: "arpatsara.p@mail.com",
    subject: "แจ้งคืนเงิน TXN-2026-100018",
    templateId: "TPL-EMAIL-006",
    templateName: "refund_notice",
    body: "เรียน คุณอาภัสราภรณ์\n\nเราได้ทำการคืนเงินจำนวน ฿5,200.00\nรายการอ้างอิง: TXN-2026-100018\nระยะเวลาที่เงินเข้าบัญชี: 3-5 วันทำการ",
    status: "sent",
    sentAt: "2026-05-24T14:18:14",
    orig: "BR-002",
    delivery: {
      attempts: 1,
      latency: "1,124ms",
      provider: "SendGrid",
    },
  },
  {
    id: 9,
    type: "sms",
    recipient: "086-334-4412",
    subject: "ลิงก์ชำระเบี้ยประกัน PLK-050019",
    templateId: "TPL-SMS-001",
    templateName: "payment_link",
    body: "CentroPay: คลิกลิงก์เพื่อชำระเบี้ยประกัน PLK-050019 จำนวน ฿24,800.00 https://pay.centropay.co.th/p/efgh5678",
    status: "sent",
    sentAt: "2026-05-24T14:10:05",
    orig: "BR-003",
    delivery: {
      attempts: 1,
      latency: "284ms",
      provider: "DTAC-SMS",
    },
  },
  {
    id: 10,
    type: "email",
    recipient: "somchai.t@mail.com",
    subject: "ยืนยันการชำระเงิน TXN-2026-100015",
    templateId: "TPL-EMAIL-003",
    templateName: "payment_confirmation",
    body: "เรียน คุณสมชาย\n\nเราได้รับการชำระเงิน TXN-2026-100015 จำนวน ฿8,400.00 เรียบร้อยแล้ว",
    status: "sent",
    sentAt: "2026-05-24T13:58:22",
    orig: "AG-118",
    delivery: {
      attempts: 1,
      latency: "912ms",
      provider: "SendGrid",
    },
  },
  {
    id: 11,
    type: "sms",
    recipient: "090-112-3344",
    subject: "แจ้งเตือนเบี้ยใกล้หมดอายุ",
    templateId: "TPL-SMS-004",
    templateName: "premium_due_reminder",
    body: "CentroPay: เบี้ยประกัน POL-2419244 ครบกำหนด 2 มิ.ย. 2569 กรุณาชำระก่อนหมดอายุ",
    status: "failed",
    sentAt: "2026-05-24T13:45:00",
    orig: "BK-007",
    delivery: {
      attempts: 3,
      latency: "timeout",
      provider: "TRUE-SMS",
      errorCode: "ERR_INVALID_NUMBER",
      errorMessage: "Recipient number is not a valid mobile number",
    },
  },
  {
    id: 12,
    type: "email",
    recipient: "nareerat.k@mail.com",
    subject: "ใบเสร็จรับเงิน RC-2026-008805",
    templateId: "TPL-EMAIL-005",
    templateName: "receipt",
    body: "เรียน คุณนารีรัตน์\n\nแนบไฟล์ใบเสร็จรับเงิน RC-2026-008805 จำนวน ฿15,600.00",
    status: "sent",
    sentAt: "2026-05-24T13:30:41",
    orig: "BR-002",
    delivery: {
      attempts: 1,
      latency: "1,056ms",
      provider: "SendGrid",
    },
  },
  {
    id: 13,
    type: "sms",
    recipient: "081-998-7761",
    subject: "ยืนยัน OTP การชำระเงิน",
    templateId: "TPL-SMS-002",
    templateName: "otp",
    body: "CentroPay: รหัส OTP ของท่านคือ 203847 (หมดอายุใน 5 นาที)",
    status: "sent",
    sentAt: "2026-05-24T13:15:19",
    orig: "AP-001",
    delivery: {
      attempts: 1,
      latency: "196ms",
      provider: "AIS-SMS",
    },
  },
  {
    id: 14,
    type: "email",
    recipient: "warunee.s@mail.com",
    subject: "การชำระเงินไม่สำเร็จ TXN-2026-100008",
    templateId: "TPL-EMAIL-007",
    templateName: "payment_failed",
    body: "เรียน คุณวารุณี\n\nการชำระเงิน TXN-2026-100008 ไม่สำเร็จ เหตุผล: ยอดเงินในบัตรไม่เพียงพอ",
    status: "queued",
    sentAt: "2026-05-24T12:58:00",
    orig: "AG-204",
    delivery: {
      attempts: 0,
      latency: "—",
      provider: "SendGrid",
    },
  },
  {
    id: 15,
    type: "sms",
    recipient: "087-665-0023",
    subject: "ลิงก์ชำระเบี้ยประกัน PLK-050010",
    templateId: "TPL-SMS-001",
    templateName: "payment_link",
    body: "CentroPay: คลิกลิงก์เพื่อชำระเบี้ยประกัน PLK-050010 จำนวน ฿36,200.00 https://pay.centropay.co.th/p/mnop3412",
    status: "sent",
    sentAt: "2026-05-24T12:44:30",
    orig: "BR-001",
    delivery: {
      attempts: 1,
      latency: "302ms",
      provider: "DTAC-SMS",
    },
  },
];
