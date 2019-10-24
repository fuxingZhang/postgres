// Type definitions
/// <reference types="node" />

import events = require("events");

export interface QueryResultBase {
  command: string;
  rowCount: number;
  oid: number;
  fields: FieldDef[];
}

export interface QueryResult extends QueryResultBase {
  rows: any[];
}

export interface ClientConfig extends ConnectionConfig {
  ssl?: boolean;
  user: string;
  host: string;
  database: string;
  password: string;
  port: number | string;
}

export declare class Client extends events.EventEmitter {
  constructor(config: ClientConfig);

  connect(): Promise<string>;
  end(): void;
  query(sql: string): Promise<QueryResult>;
}

export interface PoolConfig extends ClientConfig {
  max?: number;
  min?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}

export declare class Pool extends events.EventEmitter {
  constructor(config?: PoolConfig);
}
