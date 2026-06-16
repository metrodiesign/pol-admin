export type OriginatorType = "branch" | "agent" | "broker" | "staff" | "app";

export interface Branch {
  id: string;
  type: "branch";
  name: string;
  code: string;
  region: string;
  address: string;
  manager: string;
  phone: string;
  /** Thai Buddhist Era year (e.g. '2552') */
  established: string;
  txnCount: number;
  volume: number;
  active: boolean;
}

export interface Agent {
  id: string;
  type: "agent" | "broker" | "staff";
  name: string;
  code: string;
  region: string;
  /** Parent branch ID */
  parent: string;
  license: string;
  /** Thai Buddhist Era year joined */
  joined: string;
  txnCount: number;
  volume: number;
  active: boolean;
}

export interface ConnectedApp {
  id: string;
  type: "app";
  name: string;
  code: string;
  region: string;
  txnCount: number;
  volume: number;
  active: boolean;
  apiVersion: string;
  lastSeen: string;
  owner: string;
}

export type Originator = Branch | Agent | ConnectedApp;
