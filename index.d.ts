// Type definitions
/// <reference types="node" />

import events = require("events");
import stream = require("stream");

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

import { ConnectionOptions } from "tls";

export interface ClientConfig extends ConnectionConfig {
    ssl?: boolean | ConnectionOptions;
}

export interface PoolConfig extends ClientConfig {
    max?: number;
    min?: number;
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    waitForConnections?: boolean;
    waitForConnectionsMillis?: number;
    queueLimit?: number;
    application_name?: string;
    Promise?: PromiseConstructorLike;
}

export interface QueryConfig {
    name?: string;
    text: string;
    values?: any[];
}

export interface Submittable {
    submit: (connection: Connection) => void;
}

export interface QueryArrayConfig extends QueryConfig {
    rowMode: 'array';
}

export interface FieldDef {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
}

export interface QueryResultBase {
    command: string;
    rowCount: number;
    oid: number;
    fields: FieldDef[];
}

export interface QueryResult extends QueryResultBase {
    rows: any[];
}

export interface QueryArrayResult extends QueryResultBase {
    rows: any[][];
}

export interface Notification {
    processId: number;
    channel: string;
    payload?: string;
}

export interface ResultBuilder extends QueryResult {
    addRow(row: any): void;
}

export interface QueryParse {
    name: string;
    text: string;
    types: string[];
}

export interface BindConfig {
    portal?: string;
    statement?: string;
    binary?: string;
    values?: Array<(Buffer | null | undefined | string)>;
}

export interface ExecuteConfig {
    portal?: string;
    rows?: string;
}

export interface MessageConfig {
    type: string;
    name?: string;
}

export class Connection extends events.EventEmitter {
    readonly stream: stream.Duplex;

    constructor(config?: ConnectionConfig);

    bind(config: BindConfig | null, more: boolean): void;
    execute(config: ExecuteConfig | null, more: boolean): void;
    parse(query: QueryParse, more: boolean): void;

    query(text: string): void;

    describe(msg: MessageConfig, more: boolean): void;
    close(msg: MessageConfig, more: boolean): void;

    flush(): void;
    sync(): void;
    end(): void;
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

export interface PoolClient extends ClientBase {
    release(err?: Error): void;
}

export class Query extends events.EventEmitter implements Submittable {
    constructor(queryTextOrConfig?: string | QueryConfig, values?: any[]);
    submit: (connection: Connection) => void;
    on(event: "row", listener: (row: any, result?: ResultBuilder) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "end", listener: (result: ResultBuilder) => void): this;
}

export class Events extends events.EventEmitter {
    on(event: "error", listener: (err: Error, client: Client) => void): this;
}

export const defaults: Defaults & ClientConfig;

import * as Pg from '.';

export const native: typeof Pg | null;
