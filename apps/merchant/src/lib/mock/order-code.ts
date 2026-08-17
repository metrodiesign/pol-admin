export function currentBeYear2Digit(date: Date = new Date()): string {
  return String(date.getFullYear() + 543).slice(-2);
}

export function generateOrderCode(sequence: number, beYear2Digit: string): string {
  return `ORD${beYear2Digit}${String(sequence).padStart(8, "0")}`;
}
