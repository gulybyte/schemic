import type { Surreal, SurrealTransaction } from "surrealdb";
import type * as classic from "zod/v4";
import type * as core from "zod/v4/core";
import type { dbinput, dboutput } from "./core";

export interface ParseDbContext<T extends core.$ZodIssueBase = core.$ZodIssue>
  extends core.ParseContext<T> {
  db?: Surreal | SurrealTransaction;
}

export interface ParseDbContextInternal<
  T extends core.$ZodIssueBase = core.$ZodIssue,
> extends core.ParseContextInternal<T> {
  db?: Surreal | SurrealTransaction;
}

export type ParsingEncodingDecodingMethodNames =
  | "parse"
  | "encode"
  | "decode"
  | "parseAsync"
  | "encodeAsync"
  | "decodeAsync"
  | "safeParse"
  | "safeEncode"
  | "safeDecode"
  | "safeParseAsync"
  | "safeEncodeAsync"
  | "safeDecodeAsync";

export interface ParsingEncodingDecodingMethods<T extends core.SomeType> {
  parse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<T> : core.output<T>;
  encode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<T> : core.output<T>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dbinput<T> : core.input<T>;
  decode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<T> : core.input<T>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<T> : core.output<T>;
  parseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<T> : core.output<T>>;
  encodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<T> : core.output<T>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dbinput<T> : core.input<T>>;
  decodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<T> : core.input<T>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<T> : core.output<T>>;
  safeParse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<T> : core.output<T>
  >;
  safeEncode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<T> : core.output<T>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dbinput<T> : core.input<T>
  >;
  safeDecode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<T> : core.input<T>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<T> : core.output<T>
  >;
  safeParseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<T> : core.output<T>
    >
  >;
  safeEncodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<T> : core.output<T>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dbinput<T> : core.input<T>
    >
  >;
  safeDecodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<T> : core.input<T>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<T> : core.output<T>
    >
  >;
}
