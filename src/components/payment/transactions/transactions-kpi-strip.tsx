import { StatCard } from "@/components/payment/stat-card";

const SPARK_UP = [4, 5, 3, 7, 8, 6, 9, 11, 10, 13];
const SPARK_DOWN = [8, 7, 9, 6, 5, 7, 4, 5, 4, 3];
const SPARK_FLAT = [5, 6, 5, 7, 6, 5, 6, 7, 6, 6];

export function TransactionsKpiStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="รายการทั้งหมด (วันนี้)"
        value="2,498"
        delta="+12.4% vs เมื่อวาน"
        direction="up"
        sparkData={SPARK_UP}
      />
      <StatCard
        label="มูลค่ารวม"
        value="฿16.58M"
        delta="+8.1% vs เมื่อวาน"
        direction="up"
        sparkData={SPARK_UP}
      />
      <StatCard
        label="ค่าธรรมเนียม PSP"
        value="฿412,140"
        delta="-0.3% vs เมื่อวาน"
        direction="down"
        sparkData={SPARK_DOWN}
      />
      <StatCard
        label="มูลค่ารับเข้าสุทธิ"
        value="฿16.13M"
        delta="+7.8% vs เมื่อวาน"
        direction="up"
        sparkData={SPARK_FLAT}
      />
    </div>
  );
}
