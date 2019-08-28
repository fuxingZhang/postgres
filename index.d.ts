import events from "events"
import stream from "stream"
import pgTypes from "pg-types"

export interface ConnectionConfig {
  user?: string;
  database?: string;
  password?: string;
  port?: number;
  host?: string;
  connectionString?: string;
  keepAlive?: boolean;
  stream?: stream.Duplex;
  statement_timeout?: false | number;
  connectionTimeoutMillis?: number;
  keepAliveInitialDelayMillis?: number;
}

export interface Defaults extends ConnectionConfig {
  poolSize?: number;
  poolIdleTimeout?: number;
  reapIntervalMillis?: number;
  binary?: boolean;
  parseInt8?: boolean;
}

export interface PoolConfig extends ClientConfig {
  // properties from module 'node-pool'
  max?: number;
  min?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;

  application_name?: string;
  Promise?: PromiseConstructorLike;
}

export class ClientBase extends events.EventEmitter {
  constructor(config?: string | ClientConfig);

  connect(): Promise<void>;
  connect(callback: (err: Error) => void): void;

  query<T extends Submittable>(queryStream: T): T;
  query(queryConfig: QueryArrayConfig, values?: any[]): Promise<QueryArrayResult>;
  query(queryConfig: QueryConfig): Promise<QueryResult>;
  query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult>;
  query(queryConfig: QueryArrayConfig, callback: (err: Error, result: QueryArrayResult) => void): void;
  query(queryTextOrConfig: string | QueryConfig, callback: (err: Error, result: QueryResult) => void): void;
  query(queryText: string, values: any[], callback: (err: Error, result: QueryResult) => void): void;

  copyFrom(queryText: string): stream.Writable;
  copyTo(queryText: string): stream.Readable;

  pauseDrain(): void;
  resumeDrain(): void;

  escapeIdentifier(str: string): string;
  escapeLiteral(str: string): string;

  on(event: "drain", listener: () => void): this;
  on(event: "error" | "notice", listener: (err: Error) => void): this;
  on(event: "notification", listener: (message: Notification) => void): this;
  // tslint:disable-next-line unified-signatures
  on(event: "end", listener: () => void): this;
}

export class Client extends ClientBase {
  constructor(config?: string | ClientConfig);

  end(): Promise<void>;
  end(callback: (err: Error) => void): void;
}

export class Pool extends events.EventEmitter {
  constructor(config?: PoolConfig);

  readonly totalCount: number;
  readonly idleCount: number;
  readonly waitingCount: number;

  connect(): Promise<PoolClient>;
  connect(callback: (err: Error, client: PoolClient, done: (release?: any) => void) => void): void;

  end(): Promise<void>;
  end(callback: () => void): void;

  query<T extends Submittable>(queryStream: T): T;
  query(queryConfig: QueryArrayConfig, values?: any[]): Promise<QueryArrayResult>;
  query(queryConfig: QueryConfig): Promise<QueryResult>;
  query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult>;
  query(queryConfig: QueryArrayConfig, callback: (err: Error, result: QueryArrayResult) => void): void;
  query(queryTextOrConfig: string | QueryConfig, callback: (err: Error, result: QueryResult) => void): void;
  query(queryText: string, values: any[], callback: (err: Error, result: QueryResult) => void): void;

  on(event: "error", listener: (err: Error, client: PoolClient) => void): this;
  on(event: "connect" | "acquire" | "remove", listener: (client: PoolClient) => void): this;
}