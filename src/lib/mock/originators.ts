import type { Branch, Agent, ConnectedApp } from "@/types/originator";

export const BRANCHES: Branch[] = [
  { id: "BR-001", type: "branch", name: "สาขาสีลม", code: "SLM", region: "กรุงเทพฯ", address: "อาคารสีลมเซ็นเตอร์ ชั้น 8, ถ.สีลม แขวงสุริยวงศ์ เขตบางรัก", manager: "ฐิตารีย์ ไพศาลพิพัฒน์", phone: "02-235-8870", established: "2552", txnCount: 1284, volume: 9842300, active: true },
  { id: "BR-002", type: "branch", name: "สาขาเชียงใหม่", code: "CNX", region: "ภาคเหนือ", address: "99/2 ถ.ห้วยแก้ว ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200", manager: "คเณศพร ปัญญาวุฒิ", phone: "053-921-440", established: "2554", txnCount: 786, volume: 5217800, active: true },
  { id: "BR-003", type: "branch", name: "สาขาภูเก็ต", code: "HKT", region: "ภาคใต้", address: "184/22 ถ.พังงา ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต 83000", manager: "ณัฏฐ์ปวีร์ ตระกูลทรัพย์", phone: "076-218-330", established: "2556", txnCount: 412, volume: 3120400, active: true },
  { id: "BR-004", type: "branch", name: "สาขาขอนแก่น", code: "KKC", region: "ภาคอีสาน", address: "47/1 ถ.หน้าเมือง ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000", manager: "อภิญญารัตน์ พงศ์อมร", phone: "043-228-110", established: "2558", txnCount: 318, volume: 2102600, active: true },
];

export const AGENTS: Agent[] = [
  { id: "AG-118", type: "agent", name: "ปาณิสรา ทองอุดม", code: "PYS", region: "กรุงเทพฯ", parent: "BR-001", license: "L-2018-04421", joined: "2563", txnCount: 92, volume: 1240000, active: true },
  { id: "AG-204", type: "agent", name: "ธีรเดช อรุณโชติ", code: "TWS", region: "ปทุมธานี", parent: "BR-001", license: "L-2019-02877", joined: "2564", txnCount: 68, volume: 884500, active: true },
  { id: "AG-251", type: "agent", name: "ศิรินภัส โพธิ์ไทร", code: "SPP", region: "นนทบุรี", parent: "BR-001", license: "L-2020-01102", joined: "2564", txnCount: 54, volume: 712300, active: true },
  { id: "AG-302", type: "agent", name: "ณัฐภัทร์ อินทรเดช", code: "NPI", region: "เชียงใหม่", parent: "BR-002", license: "L-2021-00284", joined: "2565", txnCount: 41, volume: 528400, active: true },
  { id: "AG-318", type: "agent", name: "พิมพ์มาดา เสริมสกุล", code: "PMJ", region: "ภูเก็ต", parent: "BR-003", license: "L-2022-00911", joined: "2566", txnCount: 28, volume: 392100, active: true },
  { id: "BK-007", type: "broker", name: "นายหน้าเซเนต์ลิงค์", code: "GLK", region: "กรุงเทพฯ", parent: "BR-001", license: "B-2017-00118", joined: "2562", txnCount: 184, volume: 2418900, active: true },
  { id: "BK-012", type: "broker", name: "เคพีดีโบรคเกอร์ไทย", code: "TCB", region: "กรุงเทพฯ", parent: "BR-001", license: "B-2018-00204", joined: "2562", txnCount: 124, volume: 1820400, active: true },
  { id: "BK-018", type: "broker", name: "ลานคำอินชัวร์โบรคเกอร์", code: "LNB", region: "เชียงใหม่", parent: "BR-002", license: "B-2020-00318", joined: "2564", txnCount: 86, volume: 1108700, active: true },
  { id: "ST-441", type: "staff", name: "อรรถวิทย์ ทวีลาภ", code: "ATS", region: "กรุงเทพฯ", parent: "BR-001", license: "EMP-2019-0441", joined: "2562", txnCount: 312, volume: 2184000, active: true },
  { id: "ST-512", type: "staff", name: "จันทรพร มงคลรัตน์", code: "JCM", region: "กรุงเทพฯ", parent: "BR-001", license: "EMP-2020-0512", joined: "2563", txnCount: 268, volume: 1840200, active: true },
  { id: "ST-604", type: "staff", name: "ภัทรนนท์ จันทรกานต์", code: "PJK", region: "เชียงใหม่", parent: "BR-002", license: "EMP-2021-0604", joined: "2564", txnCount: 214, volume: 1502800, active: true },
  { id: "ST-718", type: "staff", name: "มัลลิกา ขวัญแก้ว", code: "MRS", region: "ภูเก็ต", parent: "BR-003", license: "EMP-2022-0718", joined: "2565", txnCount: 158, volume: 1124300, active: true },
  { id: "ST-820", type: "staff", name: "วรัญชลี ภูริพัฒน์", code: "WRY", region: "ขอนแก่น", parent: "BR-004", license: "EMP-2022-0820", joined: "2565", txnCount: 124, volume: 884100, active: true },
  { id: "ST-852", type: "staff", name: "ชยพร โกศลกิจ", code: "CPK", region: "ขอนแก่น", parent: "BR-004", license: "EMP-2023-0852", joined: "2566", txnCount: 96, volume: 612400, active: false },
];

export const CONNECTED_APPS: ConnectedApp[] = [
  { id: "AP-001", type: "app", name: "iPolicy Mobile", code: "IPM", region: "—", txnCount: 2104, volume: 14820500, active: true, apiVersion: "v2.4", lastSeen: "14:32", owner: "ทีม Mobile" },
  { id: "AP-002", type: "app", name: "Renewal Portal", code: "RNP", region: "—", txnCount: 1620, volume: 11304800, active: true, apiVersion: "v2.4", lastSeen: "14:31", owner: "ทีม Renewal" },
  { id: "AP-003", type: "app", name: "Claims Self-Service", code: "CSS", region: "—", txnCount: 408, volume: 2104500, active: false, apiVersion: "v2.3", lastSeen: "08:14", owner: "ทีม Claims" },
];
