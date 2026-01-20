import { DateTime, Uuid } from "surrealdb";
import {
  core,
  ZodString as OriginalZodString,
  ZodDate as OriginalZodDate,
  ZodGUID as OriginalZodGUID,
  ZodUUID as OriginalZodUUID,
  ZodTuple as OriginalZodTuple,
} from "zod/v4";
import { type _patch, patch } from "./utils";

// string

export type ZodString = ZodSurrealString;
export type ZodSurrealString = _patch<
  OriginalZodString,
  string,
  string,
  { type: "string" }
>;

export const ZodSurrealString = patch<ZodSurrealString>({
  original: OriginalZodString,
  name: "ZodSurrealString",
  patchDef(def) {
    def.surreal.type = "string";
  },
});

export function string(
  params?: string | core.$ZodStringParams,
): ZodSurrealString;
export function string<T extends string>(
  params?: string | core.$ZodStringParams,
): core.$ZodType<T, T>;
export function string(
  params?: string | core.$ZodStringParams,
): ZodSurrealString {
  return core._string(ZodSurrealString, params) as any;
}

// guid
export type ZodGUID = ZodSurrealGUID;

export type ZodSurrealGUID = _patch<
  OriginalZodGUID,
  Uuid,
  string | Uuid,
  { type: "uuid" }
>;

export const ZodSurrealGUID = patch<ZodSurrealGUID>({
  original: OriginalZodGUID,
  name: "SurrealZodGUID",
  patchDef(def) {
    def.surreal.type = "uuid";
  },
  beforeParse(payload) {
    if (payload.value instanceof Uuid) {
      return payload;
    }
  },
  onRunSuccess(result) {
    result.value = new Uuid(result.value as string);
  },
});

export function guid(params?: string | core.$ZodGUIDParams) {
  return new ZodSurrealGUID({
    type: "string",
    check: "string_format",
    format: "guid",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "uuid",
    },
  });
}

// uuid

export type ZodUUID = SurrealZodUUID;

export type SurrealZodUUID = _patch<
  OriginalZodUUID,
  Uuid,
  string | Uuid,
  { type: "uuid" }
>;

export const SurrealZodUUID = patch<SurrealZodUUID>({
  original: OriginalZodUUID,
  name: "SurrealZodUUID",
  patchDef(def) {
    def.surreal.type = "uuid";
  },
  beforeParse(payload) {
    if (payload.value instanceof Uuid) {
      return payload;
    }
  },
  onRunSuccess(result) {
    if (!(result.value instanceof Uuid)) {
      result.value = new Uuid(result.value as string);
    }
  },
});

export function uuid(params?: string | core.$ZodUUIDParams) {
  return new SurrealZodUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...core.util.normalizeParams(params),
    surreal: {
      type: "uuid",
    },
  });
}

// uuidv4
export function uuidv4(params?: string | core.$ZodUUIDv4Params) {
  return new SurrealZodUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "uuid",
    },
  });
}

// uuidv6
export function uuidv6(params?: string | core.$ZodUUIDv6Params) {
  return new SurrealZodUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "uuid",
    },
  });
}

// uuidv7
export function uuidv7(params?: string | core.$ZodUUIDv7Params) {
  return new SurrealZodUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "uuid",
    },
  });
}

// date

export type ZodDate = ZodSurrealDate;
export type ZodSurrealDate = _patch<
  OriginalZodDate,
  Date,
  Date | DateTime,
  { type: "datetime" }
>;
export const ZodSurrealDate = patch<ZodSurrealDate>({
  original: OriginalZodDate,
  name: "ZodSurrealDate",
  patchDef(def) {
    def.surreal.type = "datetime";
  },
  beforeParse(payload) {
    if (payload.value instanceof DateTime) {
      payload.value = payload.value.toDate();
      return payload;
    }
  },
});
export function date(params?: string | core.$ZodDateParams) {
  return core._date(ZodSurrealDate, params);
}

// tuple

export type ZodTuple = ZodSurrealTuple;
export type ZodSurrealTuple<
  T extends core.util.TupleItems = readonly core.$ZodType[],
  Rest extends core.SomeType | null = core.$ZodType | null,
> = _patch<OriginalZodTuple<T, Rest>>;
export const ZodSurrealTuple = patch<ZodSurrealTuple>({
  original: OriginalZodTuple,
  name: "ZodSurrealTuple",
});
export function tuple<T extends readonly [core.SomeType, ...core.SomeType[]]>(
  items: T,
  params?: string | core.$ZodTupleParams,
): ZodSurrealTuple<T, null>;
export function tuple<
  T extends readonly [core.SomeType, ...core.SomeType[]],
  Rest extends core.SomeType,
>(
  items: T,
  rest: Rest,
  params?: string | core.$ZodTupleParams,
): ZodSurrealTuple<T, Rest>;
export function tuple(
  items: [],
  params?: string | core.$ZodTupleParams,
): ZodSurrealTuple<[], null>;
export function tuple(
  items: core.SomeType[],
  _paramsOrRest?: string | core.$ZodTupleParams | core.SomeType,
  _params?: string | core.$ZodTupleParams,
) {
  const hasRest = _paramsOrRest instanceof core.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodSurrealTuple({
    type: "tuple",
    items: items as any as core.$ZodType[],
    rest,
    ...core.util.normalizeParams(params),
    surreal: {
      type: "any",
    },
  }) as any;
}
