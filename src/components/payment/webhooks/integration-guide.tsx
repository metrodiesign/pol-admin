import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function IntegrationGuide() {
  return (
    <Card>
      <CardHeader className="border-b border-[rgba(145,158,171,0.12)]">
        <CardTitle>Integration Guide</CardTitle>
        <CardDescription>
          ตัวอย่างการเรียก CentroPay API จากแอปต้นทาง
        </CardDescription>
      </CardHeader>

      <CardContent className="py-4 space-y-6">
        {/* Create Payment Link */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">สร้าง Payment Link</h3>
          <div className="overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-[1.8]">
            <span className="text-muted-foreground"># สร้าง Payment Link</span>
            <br />
            <span className="text-foreground">POST </span>
            <span className="text-primary">
              https://api.centropay.co.th/v1/payment-links
            </span>
            <br />
            <span className="text-foreground">Authorization: Bearer </span>
            <span className="text-primary">sk_live_...</span>
            <br />
            <br />
            <span className="text-foreground">{"{"}</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;originator_id&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;BR-001&quot;
            </span>
            <span className="text-foreground">,</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;customer&quot;
            </span>
            <span className="text-foreground">{": {"} </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;name&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;เมธาวิน อักษรเลิศ&quot;
            </span>
            <span className="text-foreground">, </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;phone&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;0812345678&quot;
            </span>
            <span className="text-foreground">{" }"},</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;items&quot;
            </span>
            <span className="text-foreground">: [</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;&nbsp;&nbsp;{"{ "}</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;policy_no&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;POL-2415088&quot;
            </span>
            <span className="text-foreground">, </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;amount&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-warning-dark dark:text-orange-400">18420.00</span>
            <span className="text-foreground">{" }"},</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;&nbsp;&nbsp;{"{ "}</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;policy_no&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;POL-2419244&quot;
            </span>
            <span className="text-foreground">, </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;amount&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-warning-dark dark:text-orange-400">9840.00</span>
            <span className="text-foreground">{" }"}</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;],</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;allowed_channels&quot;
            </span>
            <span className="text-foreground">: [</span>
            <span className="text-success-dark dark:text-green-400">
              &quot;card&quot;
            </span>
            <span className="text-foreground">, </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;promptpay&quot;
            </span>
            <span className="text-foreground">, </span>
            <span className="text-success-dark dark:text-green-400">
              &quot;installment&quot;
            </span>
            <span className="text-foreground">],</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;expires_in_hours&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-warning-dark dark:text-orange-400">72</span>
            <span className="text-foreground">,</span>
            <br />
            <span className="text-foreground">&nbsp;&nbsp;</span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;notify&quot;
            </span>
            <span className="text-foreground">{": {"} </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;sms&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-warning-dark dark:text-orange-400">true</span>
            <span className="text-foreground">, </span>
            <span className="text-violet-500 dark:text-violet-400">
              &quot;email&quot;
            </span>
            <span className="text-foreground">: </span>
            <span className="text-warning-dark dark:text-orange-400">true</span>
            <span className="text-foreground">{" }"}</span>
            <br />
            <span className="text-foreground">{"}"}</span>
          </div>
        </div>

        {/* Event Object Reference */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Event Object (ตัวอย่าง)</h3>
          <div className="overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-[1.8]">
            <pre className="text-foreground whitespace-pre">{`{
  "id": "evt_8a72b1",
  "type": "payment.succeeded",
  "created": "2026-05-24T14:31:18",
  "livemode": true,
  "data": {
    "object": {
      "id": "TXN-2026-100023",
      "amount": 18420.00,
      "currency": "THB",
      "status": "succeeded",
      "psp": "2C2P",
      "customer": {
        "name": "เมธาวิน อักษรเลิศ",
        "phone": "0812345678"
      }
    }
  }
}`}</pre>
          </div>
        </div>

        {/* Event Types Reference */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Event Types ที่รองรับ</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { evt: "payment.succeeded", desc: "ธุรกรรมชำระเงินสำเร็จ" },
              { evt: "payment.failed", desc: "ธุรกรรมล้มเหลว" },
              { evt: "payment.refunded", desc: "คืนเงินเรียบร้อย" },
              { evt: "payment.voided", desc: "ยกเลิกธุรกรรมแล้ว" },
              { evt: "payment.authorized", desc: "อนุมัติวงเงินแล้ว" },
              { evt: "payment.captured", desc: "ตัดเงินแล้ว (capture)" },
              { evt: "payment.pending", desc: "รอการชำระเงิน" },
              { evt: "link.created", desc: "สร้าง payment link ใหม่" },
              { evt: "link.viewed", desc: "ลูกค้าเปิดดู payment link" },
              { evt: "link.expired", desc: "payment link หมดอายุ" },
            ].map(({ evt, desc }) => (
              <div
                key={evt}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <code className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 font-mono text-[10px] text-primary shrink-0">
                  {evt}
                </code>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
