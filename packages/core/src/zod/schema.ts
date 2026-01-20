import { BoundQuery, Duration, surql } from "surrealdb";
import * as core from "zod/v4/core";
import * as classic from "zod/v4";
import {} from "zod/v4/core";
import { inlineQueryParameters } from "../surql";
import type { dbinput, dboutput } from "./core";
import type { ParseDbContext, ParseDbContextInternal } from "./parse";
import { processors } from "./json-schema";
// import { stringProcessor } from '../../../../../../colinhacks/zod/packages/zod/v4/core/json-schema-processors';

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodSurrealType      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodSurrealTypeDefInternals {
  type?:
    | "string"
    | "any"
    // | "field"
    // | "record_id"
    // | "table"
    // | "uuid"
    // | "datetime"
    | "duration";
}

export interface ZodSurrealTypeDef extends core.$ZodTypeDef {
  surreal: ZodSurrealTypeDefInternals;
}

export interface ZodSurrealTypeInternals<
  out O = unknown,
  out I = unknown,
  out DBO = O,
  out DBI = I,
> extends core.$ZodTypeInternals<O, I> {
  def: ZodSurrealTypeDef;

  /** @internal */
  dboutput: DBO;
  /** @internal */
  dbinput: DBI;

  /** @internal */
  optin?: "optional" | undefined;
  /** @internal */
  optout?: "optional" | undefined;

  /** @internal */
  dboptin?: "optional" | undefined;
  /** @internal */
  dboptout?: "optional" | undefined;
}

export interface ZodSurrealType<
  out O = unknown,
  out I = unknown,
  out DBO = O,
  out DBI = I,
  out Internals extends ZodSurrealTypeInternals<
    O,
    I,
    DBO,
    DBI
  > = ZodSurrealTypeInternals<O, I, DBO, DBI>,
> extends core.$ZodType<O, I, Internals> {
  "~standard": core.ZodStandardSchemaWithJSON<this>;
  /** Converts this schema to a JSON Schema representation. */
  toJSONSchema(
    params?: core.ToJSONSchemaParams,
  ): core.ZodStandardJSONSchemaPayload<this>;

  // base methods
  check(
    ...checks: (
      | core.CheckFn<core.output<this>>
      | core.$ZodCheck<core.output<this>>
    )[]
  ): this;
  with(
    ...checks: (
      | core.CheckFn<core.output<this>>
      | core.$ZodCheck<core.output<this>>
    )[]
  ): this;
  clone(def?: Internals["def"], params?: { parent: boolean }): this;
  register<R extends core.$ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [core.$replace<R["_meta"], this>?]
        : [core.$replace<R["_meta"], this>]
      : ["Incompatible schema"]
  ): this;

  brand<
    T extends PropertyKey = PropertyKey,
    Dir extends "in" | "out" | "inout" = "out",
  >(value?: T): PropertyKey extends T ? this : core.$ZodBranded<this, T, Dir>;

  // parsing/encoding/decoding
  parse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<this> : core.output<this>;
  encode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dbinput<this> : core.input<this>;
  decode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<this> : core.output<this>;
  parseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<this> : core.output<this>>;
  encodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dbinput<this> : core.input<this>>;
  decodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<this> : core.output<this>>;
  safeParse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<this> : core.output<this>
  >;
  safeEncode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dbinput<this> : core.input<this>
  >;
  safeDecode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<this> : core.output<this>
  >;
  safeParseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;
  spa<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;
  safeEncodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dbinput<this> : core.input<this>
    >
  >;
  safeDecodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;
}

export interface _ZodSurrealType<
  Internals extends ZodSurrealTypeInternals = ZodSurrealTypeInternals,
> extends ZodSurrealType<any, any, any, any, Internals> {}

export const ZodSurrealType: core.$constructor<ZodSurrealType> =
  core.$constructor("ZodSurrealType", (inst, def) => {
    // @ts-expect-error - we will be overriding the type property
    core.$ZodType.init(inst, def);

    inst._zod.def.surreal ??= {};

    Object.assign(inst["~standard"], {
      jsonSchema: {
        input: core.createStandardJSONSchemaMethod(inst, "input"),
        output: core.createStandardJSONSchemaMethod(inst, "output"),
      },
    });
    inst.toJSONSchema = core.createToJSONSchemaMethod(inst, {});

    // base methods
    inst.check = (...checks) => {
      return inst.clone(
        core.util.mergeDefs(def, {
          checks: [
            ...(def.checks ?? []),
            ...checks.map((ch) =>
              typeof ch === "function"
                ? {
                    _zod: { check: ch, def: { check: "custom" }, onattach: [] },
                  }
                : ch,
            ),
          ],
        }),
        {
          parent: true,
        },
      );
    };
    inst.with = inst.check;
    inst.clone = (def, params) => core.clone(inst, def, params);
    inst.brand = () => inst as any;
    inst.register = ((reg: any, meta: any) => {
      reg.add(inst, meta);
      return inst;
    }) as any;

    // parsing/encoding/decoding
    inst.parse = (data, params) => classic.parse(inst, data, params);
    inst.decode = (data, params) => classic.decode(inst, data, params);
    inst.encode = (data, params) => classic.encode(inst, data, params);
    inst.parseAsync = (data, params) => classic.parseAsync(inst, data, params);
    inst.decodeAsync = (data, params) =>
      classic.decodeAsync(inst, data, params);
    inst.encodeAsync = (data, params) =>
      classic.encodeAsync(inst, data, params);
    inst.safeParse = (data, params) =>
      classic.safeParse(inst, data, params) as any;
    inst.safeDecode = (data, params) =>
      classic.safeDecode(inst, data, params) as any;
    inst.safeEncode = (data, params) =>
      classic.safeEncode(inst, data, params) as any;
    inst.safeParseAsync = (data, params) =>
      classic.safeParseAsync(inst, data, params) as any;
    inst.spa = inst.safeParseAsync;
    inst.safeDecodeAsync = (data, params) =>
      classic.safeDecodeAsync(inst, data, params) as any;
    inst.safeEncodeAsync = (data, params) =>
      classic.safeEncodeAsync(inst, data, params) as any;

    return inst;
  });

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      ZodSurrealField      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////

// ZodSurrealField is used when context is switched from schema definition to
// database field definition (calling any $-prefixed function)

export interface ZodSurrealFieldDef<O = unknown, I = unknown> {
  type: "any";
  innerType: core.$ZodType<O, I>;

  surreal: {
    type: ZodSurrealTypeDefInternals["type"];
    field: {
      default?: {
        value: BoundQuery;
        always?: boolean;
        parse?: boolean;
      };
      readonly?: boolean;
      comment?: string;
      assert?: BoundQuery;
      value?: BoundQuery;
    };
  };
}

export interface ZodSurrealFieldInternals<
  out O = unknown,
  out I = unknown,
  out DBO = O,
  out DBI = I,
> extends ZodSurrealTypeInternals<O, I, DBO, DBI> {
  def: ZodSurrealFieldDef<O, I>;
}

type UnwrapField<T> =
  T extends ZodSurrealField<infer I, any, any, any, any, any>
    ? UnwrapField<I>
    : T;

export interface ZodSurrealField<
  T extends ZodSurrealType = ZodSurrealType,
  O = core.output<T>,
  I = core.input<T>,
  DBO = dboutput<T>,
  DBI = dbinput<T>,
  Options extends string = "",
> extends core.$ZodType<
      O,
      I,
      ZodSurrealFieldInternals<O, I, DBO, DBI>
      // "$default" | "$defaultAlways" extends Options
      //   ? Omit<ZodSurrealFieldInternals<O, I, DBO, DBI>, "optin" | "outout"> & {
      //       optin: "optional";
      //       optout: "optional";
      //       dboptin: "optional";
      //     } & (T extends OptionalOutSchema
      //         ? {
      //             dboptout: "optional";
      //           }
      //         : {
      //             dboptout?: "optional" | undefined;
      //           })
      //   : ZodSurrealFieldInternals<O, I, DBO, DBI> & {
      //       dboptin: T["_zod"]["optin"];
      //       dboptout: T["_zod"]["optout"];
      //     }
    >,
    ZodSurrealFieldMethods<Options> {
  // parsing/encoding/decoding
  parse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<this> : core.output<this>;
  encode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dbinput<this> : core.input<this>;
  decode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Ctx extends { db: any } ? dboutput<this> : core.output<this>;
  parseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<this> : core.output<this>>;
  encodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dbinput<this> : core.input<this>>;
  decodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Promise<Ctx extends { db: any } ? dboutput<this> : core.output<this>>;
  safeParse<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<this> : core.output<this>
  >;
  safeEncode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dbinput<this> : core.input<this>
  >;
  safeDecode<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): classic.ZodSafeParseResult<
    Ctx extends { db: any } ? dboutput<this> : core.output<this>
  >;
  safeParseAsync<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;
  spa<Ctx extends ParseDbContext>(
    data: unknown,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;
  safeEncodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dboutput<this> : core.output<this>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dbinput<this> : core.input<this>
    >
  >;
  safeDecodeAsync<Ctx extends ParseDbContext>(
    data: Ctx extends { db: any } ? dbinput<this> : core.input<this>,
    params?: Ctx,
  ): Promise<
    classic.ZodSafeParseResult<
      Ctx extends { db: any } ? dboutput<this> : core.output<this>
    >
  >;

  // unwrap
  unwrap(): UnwrapField<T>;
}

// Helper for tracking ZodSurrealField parameters
type __<T, Options extends string> = ZodSurrealField<
  T & ZodSurrealType,
  core.output<T>,
  core.input<T>,
  dboutput<T>,
  dbinput<T>,
  Options
>;

// Helper for tracking ZodSurrealField parameters
type _<T, O, I, DBO, DBI, Options extends string> = ZodSurrealField<
  T & ZodSurrealType,
  O,
  I,
  DBO,
  DBI,
  Options
>;

export interface ZodSurrealFieldMethods<Options extends string = never> {
  $default(
    value: core.util.NoUndefined<core.output<this>> | BoundQuery,
  ): _<
    this,
    core.output<this> | undefined,
    core.input<this> | undefined,
    dboutput<this>,
    dbinput<this> | undefined,
    Options | "$default" | "$prefault" | "$defaultAlways" | "$prefaultAlways"
  >;
  $prefault(
    value: core.util.NoUndefined<core.output<this>> | BoundQuery,
  ): _<
    this,
    core.output<this> | undefined,
    core.input<this> | undefined,
    dboutput<this>,
    dbinput<this> | undefined,
    Options | "$default" | "$prefault" | "$defaultAlways" | "$prefaultAlways"
  >;
  $defaultAlways(
    value: core.util.NoUndefined<core.output<this>> | BoundQuery,
  ): _<
    this,
    core.output<this> | undefined,
    core.input<this> | undefined,
    dboutput<this>,
    dbinput<this> | undefined,
    Options | "$default" | "$prefault" | "$defaultAlways" | "$prefaultAlways"
  >;
  $prefaultAlways(
    value: core.util.NoUndefined<core.output<this>> | BoundQuery,
  ): _<
    this,
    core.output<this> | undefined,
    core.input<this> | undefined,
    dboutput<this>,
    dbinput<this> | undefined,
    Options | "$default" | "$prefault" | "$defaultAlways" | "$prefaultAlways"
  >;
  $readonly(readonly?: boolean): __<this, Options | "$readonly">;
  $value(value: BoundQuery): __<this, Options | "$value">;
  $assert(assert: BoundQuery): __<this, Options | "$assert">;
  $comment(comment: string): __<this, Options | "$comment">;
}

export const ZodSurrealField: core.$constructor<ZodSurrealField> =
  core.$constructor("ZodSurrealField", (inst, def) => {
    // @ts-expect-error
    core.$ZodType.init(inst, def);
    def.surreal.field ??= {};
    const isField = inst._zod.traits.size === 2;

    if (def.surreal.field.default) {
      inst._zod.optin = "optional";
      inst._zod.optout = "optional";
      inst._zod.dboptin = "optional";
    }

    // parsing/encoding/decoding
    inst.parse = (data, params) => classic.parse(inst, data, params);
    inst.decode = (data, params) => classic.decode(inst, data, params);
    inst.encode = (data, params) => classic.encode(inst, data, params);
    inst.parseAsync = (data, params) => classic.parseAsync(inst, data, params);
    inst.decodeAsync = (data, params) =>
      classic.decodeAsync(inst, data, params);
    inst.encodeAsync = (data, params) =>
      classic.encodeAsync(inst, data, params);
    inst.safeParse = (data, params) =>
      classic.safeParse(inst, data, params) as any;
    inst.safeDecode = (data, params) =>
      classic.safeDecode(inst, data, params) as any;
    inst.safeEncode = (data, params) =>
      classic.safeEncode(inst, data, params) as any;
    inst.safeParseAsync = (data, params) =>
      classic.safeParseAsync(inst, data, params) as any;
    inst.spa = inst.safeParseAsync;
    inst.safeDecodeAsync = (data, params) =>
      classic.safeDecodeAsync(inst, data, params) as any;
    inst.safeEncodeAsync = (data, params) =>
      classic.safeEncodeAsync(inst, data, params) as any;

    // ----------- Database Only Methods -----------
    inst.$default = (value) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            default: {
              value: value instanceof BoundQuery ? value : surql`${value}`,
              always: false,
              parse: false,
            },
          },
        },
      }) as any;
    };
    inst.$prefault = (value) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            default: {
              value: value instanceof BoundQuery ? value : surql`${value}`,
              always: false,
              parse: true,
            },
          },
        },
      }) as any;
    };
    inst.$defaultAlways = (value) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            default: {
              value: value instanceof BoundQuery ? value : surql`${value}`,
              always: true,
            },
          },
        },
      }) as any;
    };
    inst.$prefaultAlways = (value) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            default: {
              value: value instanceof BoundQuery ? value : surql`${value}`,
              always: true,
              parse: true,
            },
          },
        },
      }) as any;
    };

    inst.$readonly = (readonly = true) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...inst._zod.def.surreal.field,
            readonly,
          },
        },
      }) as any;
    };

    inst.$comment = (comment) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            comment,
          },
        },
      }) as any;
    };

    inst.$assert = (assert) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            assert,
          },
        },
      }) as any;
    };

    inst.$value = (value) => {
      return new ZodSurrealField({
        type: "any",
        ...(isField ? inst._zod.def : {}),
        innerType: isField ? inst._zod.def.innerType : inst,
        surreal: {
          type: "any",
          ...(isField ? inst._zod.def.surreal : {}),
          field: {
            ...(isField ? inst._zod.def.surreal.field : {}),
            value,
          },
        },
      }) as any;
    };

    inst.unwrap = () => inst._zod.def.innerType as any;

    if (isField) {
      inst._zod.parse = (payload, ctx: ParseDbContextInternal) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }

        // Forward direction (decode): apply defaults for undefined input
        let promise: Promise<core.ParsePayload> | undefined;
        if (def.innerType._zod.optin === "optional") {
          const result = def.innerType._zod.run(payload, ctx);
          if (result instanceof Promise)
            return result.then((r) => {
              if (r.issues.length && payload.value === undefined) {
                return { issues: [], value: undefined };
              }
              return result;
            });
          if (result.issues.length && payload.value === undefined) {
            console.log("err");
            return { issues: [], value: undefined };
          }
          console.log("got default locally");
          return result;
        }

        // If database default is to be resolved
        if (
          def.surreal.field.default &&
          payload.value === undefined &&
          ctx.db
        ) {
          return ctx.db
            .query<[any]>(
              `{ ${inlineQueryParameters(def.surreal.field.default.value)} }`,
            )
            .then(([result]) => {
              payload.value = result;

              // $prefault() does validation on the resolved value
              if (def.surreal.field.default?.parse) {
                return def.innerType._zod.run(payload, ctx);
              }

              /**
               * $default() returns the default value immediately in forward direction.
               * It doesn't pass the default value into the validator ("prefault").
               * There's no reason to pass the default value through validation.
               * The validity of the default is enforced by TypeScript statically.
               * Otherwise, it's the responsibility of the user to ensure the default is valid.
               * In the case of pipes with divergent in/out types, you can specify
               * the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.
               */
              return payload;
            });
        }

        return def.innerType._zod.run(payload, ctx);
      };
    }

    return inst;
  });

////////////////////////////////////////////////
////////////////////////////////////////////////
//////////                            //////////
//////////      ZodSurrealString      //////////
//////////                            //////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export interface ZodSurrealStringDef extends ZodSurrealTypeDef {
  type: "string";
  coerce?: boolean;
  checks?: core.$ZodCheck<string>[];
  surreal: {
    type: "string";
  };
}

export interface ZodSurrealStringInternals<Input, DBInput = Input>
  extends ZodSurrealTypeInternals<string, Input, string, DBInput> {
  def: ZodSurrealStringDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;

  /** @deprecated Internal API, use with caution (not deprecated) */
  isst: core.$ZodIssueInvalidType;
  bag: core.util.LoosePartial<{
    minimum: number;
    maximum: number;
    patterns: Set<RegExp>;
    format: string;
    contentEncoding: string;
  }>;
}

// Base String

export interface _ZodSurrealString<
  Internals extends
    ZodSurrealStringInternals<unknown> = ZodSurrealStringInternals<unknown>,
> extends _ZodSurrealType<Internals>,
    ZodSurrealFieldMethods {
  format: string | null;
  minLength: number | null;
  maxLength: number | null;

  // miscellaneous checks
  regex(regex: RegExp, params?: string | core.$ZodCheckRegexParams): this;
  includes(value: string, params?: string | core.$ZodCheckIncludesParams): this;
  startsWith(
    value: string,
    params?: string | core.$ZodCheckStartsWithParams,
  ): this;
  endsWith(value: string, params?: string | core.$ZodCheckEndsWithParams): this;
  min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
  nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
  lowercase(params?: string | core.$ZodCheckLowerCaseParams): this;
  uppercase(params?: string | core.$ZodCheckUpperCaseParams): this;

  // transforms
  trim(): this;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): this;
  toLowerCase(): this;
  toUpperCase(): this;
  slugify(): this;
}

export const _ZodSurrealString: core.$constructor<_ZodSurrealString> =
  core.$constructor("_ZodSurrealString", (inst, def) => {
    // @ts-expect-error
    core.$ZodString.init(inst, def);
    ZodSurrealType.init(inst, def);
    // @ts-expect-error
    ZodSurrealField.init(inst, def);

    inst._zod.processJSONSchema = (ctx, json, params) =>
      processors.stringProcessor(inst, ctx, json, params);

    const bag = inst._zod.bag;
    inst.format = bag.format ?? null;
    inst.minLength = bag.minimum ?? null;
    inst.maxLength = bag.maximum ?? null;

    // validations
    inst.regex = (...args) => inst.check(core._regex(...args));
    inst.includes = (...args) => inst.check(core._includes(...args));
    inst.startsWith = (...args) => inst.check(core._startsWith(...args));
    inst.endsWith = (...args) => inst.check(core._endsWith(...args));
    inst.min = (...args) => inst.check(core._minLength(...args));
    inst.max = (...args) => inst.check(core._maxLength(...args));
    inst.length = (...args) => inst.check(core._length(...args));
    inst.nonempty = (...args) => inst.check(core._minLength(1, ...args));
    inst.lowercase = (params) => inst.check(core._lowercase(params));
    inst.uppercase = (params) => inst.check(core._uppercase(params));

    // transforms
    inst.trim = () => inst.check(core._trim());
    inst.normalize = (...args) => inst.check(core._normalize(...args));
    inst.toLowerCase = () => inst.check(core._toLowerCase());
    inst.toUpperCase = () => inst.check(core._toUpperCase());
    inst.slugify = () => inst.check(core._slugify());

    return inst;
  });

// String w/ Formats

export interface ZodSurrealString
  extends _ZodSurrealString<ZodSurrealStringInternals<string>> {
  // string format checks
  /** @deprecated Use `z.email()` instead. */
  email(params?: string | core.$ZodCheckEmailParams): this;
  // /** @deprecated Use `z.url()` instead. */
  // url(params?: string | core.$ZodCheckURLParams): this;
  // /** @deprecated Use `z.jwt()` instead. */
  // jwt(params?: string | core.$ZodCheckJWTParams): this;
  // /** @deprecated Use `z.emoji()` instead. */
  // emoji(params?: string | core.$ZodCheckEmojiParams): this;
  // /** @deprecated Use `z.guid()` instead. */
  // guid(params?: string | core.$ZodCheckGUIDParams): this;
  // /** @deprecated Use `z.uuid()` instead. */
  // uuid(params?: string | core.$ZodCheckUUIDParams): this;
  // /** @deprecated Use `z.uuid()` instead. */
  // uuidv4(params?: string | core.$ZodCheckUUIDParams): this;
  // /** @deprecated Use `z.uuid()` instead. */
  // uuidv6(params?: string | core.$ZodCheckUUIDParams): this;
  // /** @deprecated Use `z.uuid()` instead. */
  // uuidv7(params?: string | core.$ZodCheckUUIDParams): this;
  // /** @deprecated Use `z.nanoid()` instead. */
  // nanoid(params?: string | core.$ZodCheckNanoIDParams): this;
  // /** @deprecated Use `z.guid()` instead. */
  // guid(params?: string | core.$ZodCheckGUIDParams): this;
  // /** @deprecated Use `z.cuid()` instead. */
  // cuid(params?: string | core.$ZodCheckCUIDParams): this;
  // /** @deprecated Use `z.cuid2()` instead. */
  // cuid2(params?: string | core.$ZodCheckCUID2Params): this;
  // /** @deprecated Use `z.ulid()` instead. */
  // ulid(params?: string | core.$ZodCheckULIDParams): this;
  // /** @deprecated Use `z.base64()` instead. */
  // base64(params?: string | core.$ZodCheckBase64Params): this;
  // /** @deprecated Use `z.base64url()` instead. */
  // base64url(params?: string | core.$ZodCheckBase64URLParams): this;
  // // /** @deprecated Use `z.jsonString()` instead. */
  // // jsonString(params?: string | core.$ZodCheckJSONStringParams): this;
  // /** @deprecated Use `z.xid()` instead. */
  // xid(params?: string | core.$ZodCheckXIDParams): this;
  // /** @deprecated Use `z.ksuid()` instead. */
  // ksuid(params?: string | core.$ZodCheckKSUIDParams): this;
  // // /** @deprecated Use `z.ipv4()` or `z.ipv6()` instead. */
  // // ip(params?: string | (core.$ZodCheckIPv4Params & { version?: "v4" | "v6" })): ZodUnion<[this, this]>;
  // /** @deprecated Use `z.ipv4()` instead. */
  // ipv4(params?: string | core.$ZodCheckIPv4Params): this;
  // /** @deprecated Use `z.ipv6()` instead. */
  // ipv6(params?: string | core.$ZodCheckIPv6Params): this;
  // /** @deprecated Use `z.cidrv4()` instead. */
  // cidrv4(params?: string | core.$ZodCheckCIDRv4Params): this;
  // /** @deprecated Use `z.cidrv6()` instead. */
  // cidrv6(params?: string | core.$ZodCheckCIDRv6Params): this;
  // /** @deprecated Use `z.e164()` instead. */
  // e164(params?: string | core.$ZodCheckE164Params): this;
  // // ISO 8601 checks
  // /** @deprecated Use `z.iso.datetime()` instead. */
  // datetime(params?: string | core.$ZodCheckISODateTimeParams): this;
  // /** @deprecated Use `z.iso.date()` instead. */
  // date(params?: string | core.$ZodCheckISODateParams): this;
  // /** @deprecated Use `z.iso.time()` instead. */
  // time(
  //   params?:
  //     | string
  //     // | {
  //     //     message?: string | undefined;
  //     //     precision?: number | null;
  //     //   }
  //     | core.$ZodCheckISOTimeParams,
  // ): this;
  // /** @deprecated Use `z.iso.duration()` instead. */
  // duration(params?: string | core.$ZodCheckISODurationParams): this;
}

export const ZodSurrealString: core.$constructor<ZodSurrealString> =
  core.$constructor("ZodSurrealString", (inst, def) => {
    _ZodSurrealString.init(inst, def);

    return inst;
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
  return new ZodSurrealString({
    type: "string",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "string",
    },
  });
}

// ZodSurrealStringFormat

export interface ZodSurrealStringFormatDef<Format extends string = string>
  extends ZodSurrealStringDef,
    core.$ZodCheckStringFormatDef<Format> {
  surreal: {
    type: "string";
  };
}

export interface ZodSurrealStringFormatInternals<Format extends string = string>
  extends ZodSurrealStringInternals<string>,
    core.$ZodCheckStringFormatInternals {
  def: ZodSurrealStringFormatDef<Format>;
}

export interface ZodSurrealStringFormat<Format extends string = string>
  extends _ZodSurrealString<ZodSurrealStringFormatInternals<Format>> {}
export const ZodSurrealStringFormat: core.$constructor<ZodSurrealStringFormat> =
  core.$constructor("ZodSurrealStringFormat", (inst, def) => {
    // @ts-expect-error
    core.$ZodStringFormat.init(inst, def);
    _ZodSurrealString.init(inst, def);
  });

// ZodSurrealEmail
export interface ZodSurrealEmailInternals
  extends ZodSurrealStringFormatInternals<"email"> {}
export interface ZodSurrealEmail extends ZodSurrealStringFormat<"email"> {
  _zod: ZodSurrealEmailInternals;
}
export const ZodSurrealEmail: core.$constructor<ZodSurrealEmail> =
  core.$constructor("ZodSurrealEmail", (inst, def) => {
    // @ts-expect-error
    core.$ZodEmail.init(inst, def);
    ZodSurrealStringFormat.init(inst, def);
  });

export function email(params?: string | core.$ZodEmailParams): ZodSurrealEmail {
  return new ZodSurrealEmail({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...core.util.normalizeParams(params),
    surreal: {
      type: "string",
    },
  });
}

// ZodSurrealGUID
export interface ZodSurrealGUIDInternals
  extends ZodSurrealStringFormatInternals<"guid"> {}
export interface ZodSurrealGUID extends ZodSurrealStringFormat<"guid"> {
  _zod: ZodSurrealGUIDInternals;
}
export const ZodSurrealGUID: core.$constructor<ZodSurrealGUID> =
  core.$constructor("ZodSurrealGUID", (inst, def) => {
    // @ts-expect-error
    core.$ZodGUID.init(inst, def);
    ZodSurrealStringFormat.init(inst, def);
  });

export function guid(params?: string | core.$ZodGUIDParams): ZodSurrealGUID {
  return new ZodSurrealGUID({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...core.util.normalizeParams(params),
    surreal: {
      type: "string",
    },
  });
}

// ZodSurrealUUID
export interface ZodSurrealUUIDInternals
  extends ZodSurrealStringFormatInternals<"uuid"> {}
export interface ZodSurrealUUID extends ZodSurrealStringFormat<"uuid"> {
  _zod: ZodSurrealUUIDInternals;
}
export const ZodSurrealUUID: core.$constructor<ZodSurrealUUID> =
  core.$constructor("ZodSurrealUUID", (inst, def) => {
    // @ts-expect-error
    core.$ZodUUID.init(inst, def);
    ZodSurrealStringFormat.init(inst, def);
  });

export function uuid(params?: string | core.$ZodUUIDParams): ZodSurrealUUID {
  return new ZodSurrealUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...core.util.normalizeParams(params),
    surreal: {
      type: "string",
    },
  });
}

export function uuidv4(
  params?: string | core.$ZodUUIDv4Params,
): ZodSurrealUUID {
  return new ZodSurrealUUID({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...core.util.normalizeParams(params),
    surreal: {
      type: "string",
    },
  });
}

// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////                              //////////
// //////////      ZodSurrealOptional      //////////
// //////////                              //////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////

function handleOptionalResult(result: core.ParsePayload, input: unknown) {
  if (result.issues.length && input === undefined) {
    return { issues: [], value: undefined };
  }
  return result;
}

// //////////////////////////////////////////////////
// //////////////////////////////////////////////////
// //////////                              //////////
// //////////      ZodSurrealRecordId      //////////
// //////////                              //////////
// //////////////////////////////////////////////////
// //////////////////////////////////////////////////

// export type ZodSurrealRecordIdValue = core.$ZodType<RecordIdValue, unknown>;

// export type inferRecordIdValue<Id extends ZodSurrealRecordIdValue> =
//   Id extends {
//     _zod: {
//       output: any;
//     };
//   }
//     ? Id["_zod"]["output"]
//     : RecordIdValue;

// export type inferRecordIdTable<T extends ZodSurrealdRecordId<string, any>> =
//   T extends ZodSurrealdRecordId<infer N> ? N : never;

// export interface ZodSurrealRecordIdDef<
//   Table extends string = string,
//   Id extends ZodSurrealRecordIdValue = ZodSurrealRecordIdValue,
// > extends core.$ZodTypeDef {
//   innerType: Id;
//   table?: Table[];

//   surreal: {
//     type: "record_id";
//   };
// }

// interface ZodSurrealRecordIdExtras {
//   output?: null | undefined;
//   input?: null | undefined;
//   dboutput?: null | undefined;
//   dbinput?: null | undefined;
// }

// export interface ZodSurrealRecordIdInternals<
//   Table extends string = string,
//   Id extends ZodSurrealRecordIdValue = ZodSurrealRecordIdValue,
//   Extras extends ZodSurrealRecordIdExtras = {},
// > extends ZodSurrealTypeInternals<
//     // O
//     | RecordId<Table, inferRecordIdValue<Id>>
//     | (Extras extends { output: infer Output } ? Output : never),
//     // I
//     | RecordId<Table, inferRecordIdValue<Id>>
//     | StringRecordId
//     | (Extras extends { input: infer Input } ? Input : never),
//     // DBO
//     | RecordId<Table, inferRecordIdValue<Id>>
//     | (Extras extends { dboutput: infer DBOutput } ? DBOutput : never),
//     // DBI
//     | RecordId<Table, inferRecordIdValue<Id>>
//     | (Extras extends { dbinput: infer DBInput } ? DBInput : never)
//   > {
//   def: ZodSurrealRecordIdDef<Table, Id>;
// }

// type ZodSurrealRecordIdTrait<
//   Tb extends string,
//   Id extends ZodSurrealRecordIdValue,
//   Extras extends ZodSurrealRecordIdExtras = {},
// > = string extends Tb
//   ? // Any Table:
//     ZodSurrealRecordIdValue extends Id
//     ? // Any Table + Any Value:
//       {
//         // Clone - Split Parameters
//         parse<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, OverrideId>;
//         parseAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, OverrideId>>;
//         safeParse<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>;
//         safeParseAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>
//         >;
//         decode<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           id:
//             | RecordId<NoInfer<OverrideTb>, NoInfer<OverrideId>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, OverrideId>;
//         decodeAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           id:
//             | RecordId<NoInfer<OverrideTb>, NoInfer<OverrideId>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, OverrideId>>;
//         safeDecode<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           id:
//             | RecordId<NoInfer<OverrideTb>, NoInfer<OverrideId>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>;
//         safeDecodeAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           id:
//             | RecordId<NoInfer<OverrideTb>, NoInfer<OverrideId>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>
//         >;

//         // From Parts - Split Parameters
//         fromParts<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<OverrideId>,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, OverrideId>;
//         fromPartsAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<OverrideId>,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, OverrideId>>;
//         safeFromParts<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<OverrideId>,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>;
//         safeFromPartsAsync<
//           OverrideTb extends string = Tb,
//           OverrideId extends RecordIdValue = core.output<Id>,
//         >(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<OverrideId>,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, OverrideId>>
//         >;

//         // Clone - Single Parameter
//         parse<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(data: unknown, params?: ParseDbContext): Override;
//         parseAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(data: unknown, params?: ParseDbContext): Promise<Override>;
//         safeParse<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<Override>;
//         safeParseAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<classic.ZodSafeParseResult<Override>>;
//         decode<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           id: NoInfer<Override> | StringRecordId,
//           params?: ParseDbContext,
//         ): Override;
//         decodeAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           id: NoInfer<Override> | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<Override>;
//         safeDecode<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           id: NoInfer<Override> | StringRecordId,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<Override>;
//         safeDecodeAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           id: NoInfer<Override> | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<classic.ZodSafeParseResult<Override>>;

//         // From Parts - Single Parameter
//         fromParts<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<Override["id"]>,
//           params?: ParseDbContext,
//         ): Override;
//         fromPartsAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<Override["id"]>,
//           params?: ParseDbContext,
//         ): Promise<Override>;
//         safeFromParts<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<Override["id"]>,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<Override>;
//         safeFromPartsAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<Override["id"]>,
//           params?: ParseDbContext,
//         ): Promise<classic.ZodSafeParseResult<Override>>;
//       }
//     : // Any Table + Typed Value:
//       {
//         // Clone - Split Parameters
//         parse<OverrideTb extends string = Tb>(
//           data: unknown,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, core.output<Id>>;
//         parseAsync<OverrideTb extends string = Tb>(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, core.output<Id>>>;
//         safeParse<OverrideTb extends string = Tb>(
//           data: unknown,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>;
//         safeParseAsync<OverrideTb extends string = Tb>(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>
//         >;
//         decode<OverrideTb extends string = Tb>(
//           data: RecordId<NoInfer<OverrideTb>, core.output<Id>> | StringRecordId,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, core.output<Id>>;
//         decodeAsync<OverrideTb extends string = Tb>(
//           data: RecordId<NoInfer<OverrideTb>, core.output<Id>> | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, core.output<Id>>>;
//         safeDecode<OverrideTb extends string = Tb>(
//           data: RecordId<NoInfer<OverrideTb>, core.output<Id>> | StringRecordId,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>;
//         safeDecodeAsync<OverrideTb extends string = Tb>(
//           data: RecordId<NoInfer<OverrideTb>, core.output<Id>> | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>
//         >;

//         // From Parts - Split Parameters
//         fromParts<OverrideTb extends string = Tb>(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): RecordId<OverrideTb, core.output<Id>>;
//         fromPartsAsync<OverrideTb extends string = Tb>(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): Promise<RecordId<OverrideTb, core.output<Id>>>;
//         safeFromParts<OverrideTb extends string = Tb>(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>;
//         safeFromPartsAsync<OverrideTb extends string = Tb>(
//           table: NoInfer<OverrideTb>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<RecordId<OverrideTb, core.output<Id>>>
//         >;

//         // Clone - Single Parameter
//         parse<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): RecordId<Override["table"]["name"], core.output<Id>>;
//         parseAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<RecordId<Override["table"]["name"], core.output<Id>>>;
//         safeParse<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<
//           RecordId<Override["table"]["name"], core.output<Id>>
//         >;
//         safeParseAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data: unknown,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<
//             RecordId<Override["table"]["name"], core.output<Id>>
//           >
//         >;
//         decode<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data:
//             | RecordId<Override["table"]["name"], core.output<Id>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): RecordId<Override["table"]["name"], core.output<Id>>;
//         decodeAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data:
//             | RecordId<Override["table"]["name"], core.output<Id>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<RecordId<Override["table"]["name"], core.output<Id>>>;
//         safeDecode<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data:
//             | RecordId<Override["table"]["name"], core.output<Id>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<
//           RecordId<Override["table"]["name"], core.output<Id>>
//         >;
//         safeDecodeAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           data:
//             | RecordId<Override["table"]["name"], core.output<Id>>
//             | StringRecordId,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<
//             RecordId<Override["table"]["name"], core.output<Id>>
//           >
//         >;

//         // From Parts - Single Parameter
//         fromParts<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): RecordId<Override["table"]["name"], core.output<Id>>;
//         fromPartsAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): Promise<RecordId<Override["table"]["name"], core.output<Id>>>;
//         safeFromParts<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): classic.ZodSafeParseResult<
//           RecordId<Override["table"]["name"], core.output<Id>>
//         >;
//         safeFromPartsAsync<
//           Override extends RecordId<string, RecordIdValue> = RecordId<
//             Tb,
//             core.output<Id>
//           >,
//         >(
//           table: NoInfer<Override["table"]["name"]>,
//           id: NoInfer<core.output<Id>>,
//           params?: ParseDbContext,
//         ): Promise<
//           classic.ZodSafeParseResult<
//             RecordId<Override["table"]["name"], core.output<Id>>
//           >
//         >;
//       }
//   : // Specific Table:
//     UnionToTuple<Tb> extends { length: 1 }
//     ? ZodSurrealRecordIdValue extends Id
//       ? // Specific Table + Any Value
//         {
//           // Clone - Split Parameters
//           parse<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           parseAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeParse<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeParseAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;
//           decode<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           decodeAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeDecode<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeDecodeAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;

//           // From Parts - Split Parameters
//           fromParts<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           fromPartsAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeFromParts<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeFromPartsAsync<
//             OverrideId extends RecordIdValue = core.output<Id>,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;

//           // From Id - Split Parameters
//           fromId<OverrideId extends RecordIdValue = core.output<Id>>(
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           fromIdAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeFromId<OverrideId extends RecordIdValue = core.output<Id>>(
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeFromIdAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;

//           // Clone - Single Parameter
//           parse<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           parseAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeParse<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeParseAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;
//           decode<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           decodeAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeDecode<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeDecodeAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;

//           // From Parts - Single Parameter
//           fromParts<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           fromPartsAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeFromParts<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeFromPartsAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;

//           // From Id - Single Parameter
//           fromId<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           fromIdAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeFromId<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeFromIdAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;
//         }
//       : // Specific Table + Typed Value
//         {
//           // Clone - Non Overridable
//           parse(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           parseAsync(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeParse(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeParseAsync(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;
//           decode(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           decodeAsync(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeDecode(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeDecodeAsync(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;

//           // From Parts - Non Overridable
//           fromParts(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           fromPartsAsync(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeFromParts(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeFromPartsAsync(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;

//           // From Id - Non Overridable
//           fromId(
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           fromIdAsync(
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeFromId(
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeFromIdAsync(
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;
//         }
//     : // Multiple Tables:
//       ZodSurrealRecordIdValue extends Id
//       ? // Multiple Tables + Any Value:
//         {
//           // Clone - Split Parameters
//           parse<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           parseAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeParse<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeParseAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;
//           decode<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           decodeAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeDecode<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeDecodeAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             data: RecordId<Tb, NoInfer<OverrideId>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;

//           // From Parts - Split Parameters
//           fromParts<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, OverrideId>;
//           fromPartsAsync<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, OverrideId>>;
//           safeFromParts<OverrideId extends RecordIdValue = core.output<Id>>(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>;
//           safeFromPartsAsync<
//             OverrideId extends RecordIdValue = core.output<Id>,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<OverrideId>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, OverrideId>>>;

//           // Clone - Single Parameter
//           parse<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           parseAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeParse<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeParseAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;
//           decode<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           decodeAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeDecode<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeDecodeAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             data: RecordId<Tb, Override["id"]> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;

//           // From Parts - Single Parameter
//           fromParts<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, Override["id"]>;
//           fromPartsAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, Override["id"]>>;
//           safeFromParts<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>;
//           safeFromPartsAsync<
//             Override extends RecordId<string, RecordIdValue> = RecordId<
//               Tb,
//               core.output<Id>
//             >,
//           >(
//             table: NoInfer<Tb>,
//             id: NoInfer<Override["id"]>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, Override["id"]>>>;
//         }
//       : // Multiple Tables + Typed Value:
//         {
//           // Clone
//           parse(
//             data: unknown,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           parseAsync(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeParse(
//             data: unknown,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeParseAsync(
//             data: unknown,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;
//           decode(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           decodeAsync(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeDecode(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeDecodeAsync(
//             data: RecordId<Tb, core.output<Id>> | StringRecordId,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;

//           // From Parts - Non Overridable
//           fromParts(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): RecordId<Tb, core.output<Id>>;
//           fromPartsAsync(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<RecordId<Tb, core.output<Id>>>;
//           safeFromParts(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>;
//           safeFromPartsAsync(
//             table: NoInfer<Tb>,
//             id: NoInfer<core.output<Id>>,
//             params?: ParseDbContext,
//           ): Promise<classic.ZodSafeParseResult<RecordId<Tb, core.output<Id>>>>;
//         };

// export type ZodSurrealdRecordId<
//   Table extends string = string,
//   Id extends ZodSurrealRecordIdValue = ZodSurrealRecordIdValue,
//   Extras extends ZodSurrealRecordIdExtras = {},
// > = Omit<
//   _ZodSurrealType<ZodSurrealRecordIdInternals<Table, Id, Extras>>,
//   | ParsingEncodingDecodingMethodNames
//   | "optional"
//   | "nullable"
//   | "nullish"
//   | "nonoptional"
// > &
//   ZodSurrealRecordIdTrait<Table, Id, Extras> & {
//     anytable(): ZodSurrealdRecordId<string, Id, Extras>;

//     table<const NewTable extends string | string[]>(
//       table: NewTable,
//     ): ZodSurrealdRecordId<
//       NewTable extends string ? NewTable : NewTable[number],
//       Id,
//       Extras
//     >;

//     /** @alias id */
//     type<NewType extends ZodSurrealRecordIdValue>(
//       innerType: NewType,
//     ): ZodSurrealdRecordId<Table, NewType, Extras>;
//     /** @alias value */
//     id<NewType extends ZodSurrealRecordIdValue>(
//       innerType: NewType,
//     ): ZodSurrealdRecordId<Table, NewType, Extras>;
//     /** @alias type */
//     value<NewType extends ZodSurrealRecordIdValue>(
//       innerType: NewType,
//     ): ZodSurrealdRecordId<Table, NewType, Extras>;

//     // Wrappers
//     optional(): ZodSurrealdRecordId<
//       Table,
//       Id,
//       Omit<Extras, "input" | "output"> & {
//         output: undefined | (Extras extends { output: infer O } ? O : never);
//         input: undefined | (Extras extends { input: infer I } ? I : never);
//       }
//     >;
//     nullable(): ZodSurrealdRecordId<
//       Table,
//       Id,
//       Omit<Extras, "input" | "output"> & {
//         output: null | (Extras extends { output: infer O } ? O : never);
//         input: null | (Extras extends { input: infer I } ? I : never);
//       }
//     >;
//     nullish(): ZodSurrealdRecordId<
//       Table,
//       Id,
//       Omit<Extras, "input" | "output"> & {
//         output:
//           | null
//           | undefined
//           | (Extras extends { output: infer O } ? O : never);
//         input:
//           | null
//           | undefined
//           | (Extras extends { input: infer I } ? I : never);
//       }
//     >;
//     nonoptional(): ZodSurrealdRecordId<
//       Table,
//       Id,
//       Omit<Extras, "input" | "output"> & {
//         output: Extras extends { output: infer O }
//           ? Exclude<O, undefined>
//           : never;
//         input: Extras extends { input: infer I }
//           ? Exclude<I, undefined>
//           : never;
//       }
//     >;
//   };

// function normalizeRecordIdDef(def: ZodSurrealRecordIdDef) {
//   const { type, context } = inferSurrealType(def.innerType);
//   const isValid = Array.from(context.type).every(
//     (option) =>
//       ["any", "string", "number", "int", "array", "object"].includes(option) ||
//       option.startsWith("array<") ||
//       option.startsWith("[") ||
//       option.startsWith("{") ||
//       option.startsWith("'") ||
//       option.startsWith('"') ||
//       /^\d+(\.\d+)?f?$/.test(option),
//   );

//   if (!isValid) {
//     throw new Error(`${type} is not valid as a RecordId's value`);
//   }

//   return {
//     ...def,
//   };
// }
// /* instanbul ignore next */
// function parseRecordIdString(id: string) {
//   let table = "";
//   let value: RecordIdValue = "";

//   const match = id.match(/^(?:⟨(.*)⟩|`(.*)`|(.*)):(?:⟨(.*)⟩|`(.*)`|(.*))$/);
//   if (!match) {
//     throw new Error(`Invalid record id string: ${id}`);
//   }

//   table = (match[1] ?? match[2] ?? match[2] ?? "").replace(/\\⟩/g, "⟩");
//   value = match[4] ?? match[5] ?? match[6] ?? "";
//   // check if value is a number
//   value = parseSurrealValue(value);
//   // console.log("result:", value);

//   return new RecordId(table, value);
// }
// /* instanbul ignore stop */

// type ParserContext = {
//   in: "root" | "array" | "object";
//   acc: string;
//   path: ("array" | "object")[];
// };

// function parseSurrealValue(str: string) {
//   const stack: {
//     in: "root" | "array" | "object";
//     value: any;
//   }[] = [];
//   let ctx: ParserContext = {
//     in: "root",
//     acc: "",
//     path: [],
//   };
//   let value: any;

//   function expr() {
//     const parsed = ctx.acc;
//     // Decimal with optional exponent
//     if (/^[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?dec$/i.test(parsed)) {
//       return new Decimal(parsed.slice(0, -3));
//     }

//     // Strict integer → Number | BigInt
//     if (/^[-+]?\d+f?$/.test(parsed)) {
//       const asBigInt = BigInt(parsed.replace(/f$/i, ""));
//       if (
//         asBigInt > BigInt(Number.MAX_SAFE_INTEGER) ||
//         asBigInt < BigInt(Number.MIN_SAFE_INTEGER)
//       ) {
//         return asBigInt;
//       }
//       return Number(parsed.replace(/f$/i, ""));
//     }

//     // Float or exponent → Number
//     if (/^[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?f?$/i.test(parsed)) {
//       return Number(parsed.replace(/f$/, ""));
//     }

//     return parsed;
//   }

//   function enter(type: "array" | "object") {
//     if (ctx.in !== "root") {
//       stack.push({ in: ctx.in, value });
//     }
//     ctx.in = type;
//     if (type === "array") {
//       value = [];
//     } else if (type === "object") {
//       value = {};
//     }
//   }

//   function exit() {
//     if (ctx.in === "array" && ctx.acc) {
//       nextArray();
//     }
//     const popped = stack.pop();
//     if (!popped) {
//       return;
//     }
//     value = popped.value;
//     ctx.in = popped.in;
//     ctx.acc = "";
//   }

//   function nextArray() {
//     (value as any[]).push(expr());
//   }

//   for (let i = 0; i < str.length; i++) {
//     const ch = str[i];
//     if (ch === "[") {
//       enter("array");
//     } else if (ch === "{") {
//       enter("object");
//     } else if (ch === "]") {
//       exit();
//     } else if (ch === "}") {
//       exit();
//     } else if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
//       continue;
//     } else if (ch === ",") {
//       if (ctx.in === "array") nextArray();
//       ctx.acc = "";
//     } else {
//       ctx.acc += ch;
//     }
//     // console.log(inspect({ ...ctx, stack }, { depth: Infinity, colors: true }));
//   }

//   return value;
// }

// export const ZodSurrealdRecordId: core.$constructor<ZodSurrealdRecordId> =
//   core.$constructor("ZodSurrealRecordId", (inst, def) => {
//     ZodSurrealType.init(inst as any, def);

//     // surreal internals
//     inst._zod.def.surreal.type = "record_id";
//     const normalized = normalizeRecordIdDef(def);

//     inst.anytable = () => {
//       return inst.clone({
//         ...def,
//         table: undefined,
//       }) as any;
//     };

//     inst.table = (table) => {
//       return inst.clone({
//         ...inst._zod.def,
//         table: Array.isArray(table) ? table : [table],
//       }) as any;
//     };

//     inst.type = (innerType) => {
//       return inst.clone({
//         ...inst._zod.def,
//         innerType,
//       }) as any;
//     };
//     inst.id = inst.type;
//     inst.value = inst.type;

//     // ------- Parsing/Encoding/Decoding -------
//     const _inst = inst as any;
//     _inst.fromParts = (
//       table: string,
//       id: RecordIdValue,
//       params?: core.ParseContext<core.$ZodIssue>,
//     ) => _inst.decode(new RecordId(table, id), params);

//     _inst.fromPartsAsync = (
//       table: string,
//       id: RecordIdValue,
//       params?: core.ParseContext<core.$ZodIssue>,
//     ) => _inst.decodeAsync(new RecordId(table, id), params);

//     _inst.safeFromParts = (
//       table: string,
//       id: RecordIdValue,
//       params?: core.ParseContext<core.$ZodIssue>,
//     ) => _inst.safeDecode(new RecordId(table, id), params);

//     _inst.safeFromPartsAsync = (
//       table: string,
//       id: RecordIdValue,
//       params?: core.ParseContext<core.$ZodIssue>,
//     ) => _inst.safeDecodeAsync(new RecordId(table, id), params);

//     if (normalized.table?.length === 1) {
//       _inst.fromId = (
//         id: RecordIdValue,
//         params?: core.ParseContext<core.$ZodIssue>,
//       ) => _inst.decode(new RecordId(normalized.table?.[0] ?? "", id), params);

//       _inst.fromIdAsync = (
//         id: RecordIdValue,
//         params?: core.ParseContext<core.$ZodIssue>,
//       ) =>
//         _inst.decodeAsync(
//           new RecordId(normalized.table?.[0] ?? "", id),
//           params,
//         );

//       _inst.safeFromId = (
//         id: RecordIdValue,
//         params?: core.ParseContext<core.$ZodIssue>,
//       ) =>
//         _inst.safeDecode(new RecordId(normalized.table?.[0] ?? "", id), params);

//       _inst.safeFromIdAsync = (
//         id: RecordIdValue,
//         params?: core.ParseContext<core.$ZodIssue>,
//       ) =>
//         _inst.safeDecodeAsync(
//           new RecordId(normalized.table?.[0] ?? "", id),
//           params,
//         );
//     }

//     inst._zod.parse = (payload, ctx) => {
//       if (payload.value instanceof RecordId) {
//         if (
//           normalized.table &&
//           !normalized.table.includes(payload.value.table.name)
//         ) {
//           payload.issues.push({
//             code: "invalid_value",
//             values: normalized.table,
//             input: payload.value.table.name,
//             message:
//               normalized.table.length > 1
//                 ? `Expected RecordId's table to be one of ${normalized.table.map(escapeIdent).join(" | ")} but found ${payload.value.table.name}`
//                 : `Expected RecordId's table to be ${normalized.table[0]} but found ${payload.value.table.name}`,
//           });
//         }

//         const schema = normalized.innerType._zod;
//         const result = schema.run({ value: payload.value.id, issues: [] }, ctx);

//         if (result instanceof Promise) {
//           return result.then((result) => {
//             if (result.issues.length) {
//               payload.issues.push(
//                 ...core.util.prefixIssues("id", result.issues),
//               );
//             }
//             payload.value = new RecordId(
//               payload.value.table.name,
//               result.value as any,
//             );
//             return payload;
//           });
//         } else if (result.issues.length) {
//           payload.issues.push(...core.util.prefixIssues("id", result.issues));
//         } else {
//           payload.value = new RecordId(
//             payload.value.table.name,
//             result.value as any,
//           );
//         }
//       } else {
//         payload.issues.push({
//           code: "invalid_type",
//           expected: "record_id",
//           input: payload.value,
//         });
//       }

//       return payload;
//     };

//     return inst;
//   });

// export function recordId<
//   const W extends string | string[],
//   I extends ZodSurrealRecordIdValue = ZodSurrealRecordIdValue,
// >(
//   what?: W,
//   innerType?: I,
// ): ZodSurrealdRecordId<W extends string ? W : W[number], I> {
//   return new ZodSurrealdRecordId({
//     // Zod would not be happy if we have a custom type here, so we use any
//     type: "any",
//     table: what ? (Array.isArray(what) ? what : [what]) : undefined,
//     innerType: innerType ?? classic.any(),

//     surreal: {
//       type: "record_id",
//     },
//   }) as any;
// }

// ///////////////////////////////////////////////
// ///////////////////////////////////////////////
// //////////                           //////////
// //////////      SurrealZodTable      //////////
// //////////                           //////////
// ///////////////////////////////////////////////
// ///////////////////////////////////////////////

// export type SurrealZodTableFields = {
//   [key: string]: core.$ZodType;
// };

// export type SurrealZodTableRelationFields = {
//   [K in "in" | "out"]?: ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>;
// } & {
//   [key: string]: core.$ZodType;
// };

// /**
//  * Normalizes the fields of a table schema to include the id field if it is not present.
//  * If the id field is present, it will be normalized using the table name and the inner type.
//  */
// type NormalizedIdField<
//   TableName extends string,
//   Fields extends SurrealZodTableFields,
//   FieldName extends string,
// > = {
//   [K in keyof Fields | FieldName]: K extends FieldName
//     ? Fields extends { [P in FieldName]: infer F }
//       ? F extends ZodSurrealdRecordId<any, infer T>
//         ? ZodSurrealdRecordId<TableName, T>
//         : F extends ZodSurrealRecordIdValue
//           ? ZodSurrealdRecordId<TableName, F>
//           : ZodSurrealdRecordId<TableName>
//       : ZodSurrealdRecordId<TableName>
//     : K extends keyof Fields
//       ? Fields[K]
//       : never;
// };

// export type NormalizedFields<
//   TableName extends string = string,
//   Fields extends SurrealZodTableFields = {},
// > = NormalizedIdField<TableName, Fields, "id">;

// export type SetConfig<Key extends string, Value> = {
//   [key in Key]: Value;
// };
// export type MergeConfig<
//   A extends Partial<SurrealZodTableConfig>,
//   B extends Partial<SurrealZodTableConfig>,
// > = Omit<A, keyof B> & B;
// export type SurrealZodTableConfigSchemafull = SetConfig<"catchall", {}>;
// export type SurrealZodTableConfigSchemaless = SetConfig<
//   "catchall",
//   Record<string, unknown>
// >;
// export type SurrealZodTableConfig = {
//   catchall: any;
// };

// export interface SurrealZodTableDef<
//   Name extends string = string,
//   Fields extends SurrealZodTableFields = {},
//   Config extends SurrealZodTableConfig = SurrealZodTableConfig,
// > extends core.$ZodTypeDef {
//   name: Name;
//   fields: NormalizedFields<Name, Fields> & Config["catchall"];
//   catchall?: core.$ZodType;

//   surreal: {
//     type: "table";
//     tableType: "any" | "normal" | "relation";
//     schemafull: boolean;
//     drop: boolean;
//     comment?: string;
//   };
// }

// export interface ZodSurrealTableInternals<
//   Name extends string = string,
//   Fields extends SurrealZodTableFields = {},
//   Config extends SurrealZodTableConfig = MergeConfig<
//     SurrealZodTableConfig,
//     SurrealZodTableConfigSchemaless
//   >,
// > extends ZodSurrealTypeInternals<
//     core.$InferObjectOutput<Fields, Config["catchall"]>,
//     core.$InferObjectInput<Fields, Config["catchall"]>,
//     $InferObjectDbOutput<Fields, Config["catchall"]>,
//     $InferObjectDbInput<Fields, Config["catchall"]>,
//     ZodSurrealInternals
//   > {
//   def: SurrealZodTableDef<Name, Fields, Config>;
// }

// export type TableKind = "any" | "normal" | "relation";

// type RelationMethods<
//   Name extends string,
//   Fields extends SurrealZodTableFields,
//   Config extends SurrealZodTableConfig,
// > = {
//   from<
//     NewFrom extends
//       | string
//       | string[]
//       | ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>,
//   >(
//     from: NewFrom,
//   ): ZodSurrealTable<
//     Name,
//     Omit<Fields, "in"> & { in: toRecordId<NewFrom> },
//     Config,
//     "relation"
//   >;

//   to<
//     NewTo extends
//       | string
//       | string[]
//       | ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>,
//   >(
//     to: NewTo,
//   ): ZodSurrealTable<
//     Name,
//     Omit<Fields, "out"> & { out: toRecordId<NewTo> },
//     Config,
//     "relation"
//   >;

//   in: RelationMethods<Name, Fields, Config>["from"];
//   out: RelationMethods<Name, Fields, Config>["to"];
// };

// type MaybeRelationMethods<
//   Kind extends TableKind,
//   Name extends string,
//   Fields extends SurrealZodTableFields,
//   Config extends SurrealZodTableConfig,
// > = Kind extends "relation" ? RelationMethods<Name, Fields, Config> : {};

// type TableMask<Keys extends PropertyKey, Kind extends TableKind> = {
//   [K in Exclude<
//     Keys,
//     "id" | (Kind extends "relation" ? "in" | "out" : never)
//   >]?: true;
// } & {
//   id?: boolean;
// } & (Kind extends "relation"
//     ? {
//         in?: boolean;
//         out?: boolean;
//       }
//     : {});

// export type ZodSurrealTable<
//   Name extends string = string,
//   Fields extends SurrealZodTableFields = {},
//   Config extends SurrealZodTableConfig = MergeConfig<
//     SurrealZodTableConfig,
//     SurrealZodTableConfigSchemaless
//   >,
//   Kind extends TableKind = "any",
// > = _ZodSurrealType<
//   ZodSurrealTableInternals<Name, NormalizedFields<Name, Fields>, Config>
// > &
//   MaybeRelationMethods<Kind, Name, Fields, Config> &
//   ParsingEncodingDecodingMethods<
//     ZodSurrealTable<Name, Fields, Config, Kind>
//   > & {
//     name<NewName extends string>(
//       name: NewName,
//     ): ZodSurrealTable<NewName, Fields, Config, Kind>;
//     fields<
//       NewFields extends Kind extends "relation"
//         ? SurrealZodTableRelationFields
//         : SurrealZodTableFields,
//     >(
//       fields: NewFields,
//     ): ZodSurrealTable<
//       Name,
//       Kind extends "relation"
//         ? {
//             [K in "in" | "out" as K extends keyof NewFields
//               ? K
//               : never]: NewFields[K];
//           } & {
//             [K in "in" | "out" as K extends keyof NewFields
//               ? never
//               : K extends keyof Fields
//                 ? K
//                 : never]: Fields[K];
//           } & Omit<NewFields, "in" | "out">
//         : NewFields,
//       Config,
//       Kind
//     >;
//     schemafull(): ZodSurrealTable<
//       Name,
//       Fields,
//       MergeConfig<Config, SurrealZodTableConfigSchemafull>,
//       Kind
//     >;
//     schemaless(): ZodSurrealTable<
//       Name,
//       Fields,
//       MergeConfig<Config, SurrealZodTableConfigSchemaless>,
//       Kind
//     >;

//     any(): ZodSurrealTable<Name, Fields, Config, "any">;
//     normal(): ZodSurrealTable<Name, Fields, Config, "normal">;
//     relation(): ZodSurrealTable<
//       Name,
//       {
//         [K in "in" | "out"]: Fields[K] extends ZodSurrealdRecordId
//           ? Fields[K]
//           : ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>;
//       } & Omit<Fields, "in" | "out">,
//       Config,
//       "relation"
//     >;

//     drop(): ZodSurrealTable<Name, Fields, Config, Kind>;
//     nodrop(): ZodSurrealTable<Name, Fields, Config, Kind>;
//     comment(comment: string): ZodSurrealTable<Name, Fields, Config, Kind>;

//     record(): ZodSurrealTable<
//       Name,
//       Fields,
//       Config,
//       Kind
//     >["_zod"]["def"]["fields"]["id"];
//     dto(): classic.ZodObject<
//       Omit<NormalizedFields<Name, Fields>, "id"> & {
//         id: classic.ZodOptional<NormalizedFields<Name, Fields>["id"]>;
//       },
//       {
//         in: Config["catchall"];
//         out: Config["catchall"];
//       }
//     >;
//     table(): Table<Name>;

//     toSurql(
//       statement?: "define",
//       options?: DefineTableOptions,
//     ): BoundQuery<[undefined]>;
//     toSurql(
//       statement: "remove",
//       options?: RemoveTableOptions,
//     ): BoundQuery<[undefined]>;
//     toSurql(statement: "info"): BoundQuery<[TableInfo]>;
//     toSurql(statement: "structure"): BoundQuery<[TableStructure]>;

//     // object-like methods

//     extend<
//       ExtraFields extends Kind extends "relation"
//         ? SurrealZodTableRelationFields
//         : SurrealZodTableFields,
//     >(
//       extraFields: ExtraFields,
//     ): ZodSurrealTable<
//       Name,
//       core.util.Extend<Fields, ExtraFields>,
//       Config,
//       Kind
//     >;

//     safeExtend<
//       ExtraFields extends Kind extends "relation"
//         ? SurrealZodTableRelationFields
//         : SurrealZodTableFields,
//     >(
//       shape: classic.SafeExtendShape<Fields, ExtraFields> &
//         Partial<Record<keyof Fields, core.SomeType>>,
//     ): ZodSurrealTable<
//       Name,
//       core.util.Extend<Fields, ExtraFields>,
//       Config,
//       Kind
//     >;

//     pick<M extends TableMask<keyof Fields, Kind>>(
//       mask: M,
//     ): M extends { id: false }
//       ? classic.ZodObject<
//           core.util.Flatten<
//             Pick<Fields, Extract<Exclude<keyof Fields, "id">, keyof M>>
//           >,
//           {
//             out: Config["catchall"];
//             in: Config["catchall"];
//           }
//         >
//       : ZodSurrealTable<
//           Name,
//           core.util.Flatten<
//             Pick<Fields, Extract<keyof Fields, keyof M | "id">>
//           >,
//           Config,
//           Kind
//         >;

//     omit<M extends TableMask<keyof Fields, Kind>>(
//       mask: M,
//     ): M extends { id: true }
//       ? classic.ZodObject<
//           core.util.Flatten<Omit<Fields, Extract<keyof Fields, keyof M>>>,
//           {
//             in: Config["catchall"];
//             out: Config["catchall"];
//           }
//         >
//       : ZodSurrealTable<
//           Name,
//           core.util.Flatten<Omit<Fields, Extract<keyof Fields, keyof M>>>,
//           Config,
//           Kind
//         >;

//     /**
//      * @returns a table schema that is partial for all fields, except for `id`
//      */
//     partial(): ZodSurrealTable<
//       Name,
//       {
//         [k in keyof Fields]: classic.ZodOptional<Fields[k]>;
//       },
//       Config,
//       Kind
//     >;

//     /**
//      * @returns an object schema that is partial for all fields, including `id`.
//      * This is equivalent to calling `.dto().partial()`
//      */
//     partial(mask: true): classic.ZodObject<
//       core.util.Flatten<{
//         [k in keyof Fields | "id"]: k extends "id"
//           ? Fields["id"] extends ZodSurrealdRecordId<infer N, infer I>
//             ? classic.ZodOptional<ZodSurrealdRecordId<N, I>>
//             : classic.ZodOptional<
//                 ZodSurrealdRecordId<Name, ZodSurrealRecordIdValue>
//               >
//           : classic.ZodOptional<Fields[k]>;
//       }>,
//       {
//         out: Config["catchall"];
//         in: Config["catchall"];
//       }
//     >;

//     /**
//      * @returns an object schema that is partial for the fields specified in
//      * the mask, if id is specified in the mask, it will be marked as optional
//      * and an object schema will be returned instead of a table schema.
//      */
//     partial<M extends TableMask<keyof Fields, Kind>>(
//       mask?: M,
//     ): M extends { id: true }
//       ? classic.ZodObject<
//           core.util.Flatten<{
//             [k in keyof Fields | "id"]: k extends keyof M
//               ? k extends "id"
//                 ? Fields["id"] extends ZodSurrealdRecordId<
//                     infer N,
//                     infer I,
//                     infer E
//                   >
//                   ? classic.ZodOptional<ZodSurrealdRecordId<N, I, E>>
//                   : classic.ZodOptional<
//                       ZodSurrealdRecordId<Name, ZodSurrealRecordIdValue>
//                     >
//                 : classic.ZodOptional<Fields[k]>
//               : Fields[k];
//           }>,
//           {
//             out: Config["catchall"];
//             in: Config["catchall"];
//           }
//         >
//       : ZodSurrealTable<
//           Name,
//           {
//             [k in keyof Fields]: k extends keyof M
//               ? classic.ZodOptional<Fields[k]>
//               : Fields[k];
//           },
//           Config,
//           Kind
//         >;

//     required(): ZodSurrealTable<
//       Name,
//       {
//         [k in keyof Fields]: classic.ZodNonOptional<Fields[k]>;
//       },
//       Config,
//       Kind
//     >;
//     required<M extends core.util.Mask<keyof Fields>>(
//       mask: M,
//     ): ZodSurrealTable<
//       Name,
//       {
//         [k in keyof Fields]: k extends keyof M
//           ? classic.ZodNonOptional<Fields[k]>
//           : Fields[k];
//       },
//       Config,
//       Kind
//     >;
//   };

// function handleFieldResult(
//   result: core.ParsePayload,
//   final: core.ParsePayload,
//   field: PropertyKey,
//   input: Record<PropertyKey, unknown>,
// ) {
//   if (result.issues.length) {
//     final.issues.push(...core.util.prefixIssues(field, result.issues));
//   }

//   if (result.value === undefined) {
//     if (field in input) {
//       // @ts-expect-error: field not index-checked on final.value, doesnt matter
//       final.value[field] = undefined;
//     }
//   } else {
//     // @ts-expect-error: field not index-checked on final.value, doesnt matter
//     final.value[field] = result.value;
//   }
// }

// function handleCatchall(
//   promises: Promise<any>[],
//   input: Record<PropertyKey, unknown>,
//   payload: core.ParsePayload,
//   ctx: core.ParseContext,
//   def: ReturnType<typeof normalizeTableDef>,
//   inst: ZodSurrealTable,
// ) {
//   const unrecognized: string[] = [];
//   const known = def.fieldNamesSet;
//   const _catchall = def.catchall!._zod;
//   const type = _catchall.def.type;
//   for (const field in input) {
//     if (known.has(field)) continue;
//     if (type === "never") {
//       unrecognized.push(field);
//       continue;
//     }

//     const result = _catchall.run({ value: input[field], issues: [] }, ctx);
//     if (result instanceof Promise) {
//       promises.push(
//         result.then((result) =>
//           handleFieldResult(result, payload, field, input),
//         ),
//       );
//     } else {
//       handleFieldResult(result, payload, field, input);
//     }
//   }

//   if (unrecognized.length) {
//     payload.issues.push({
//       code: "unrecognized_keys",
//       keys: unrecognized,
//       input,
//       inst,
//     });
//   }

//   if (!promises.length) return payload;
//   return Promise.all(promises).then(() => payload);
// }

// function normalizeTableDef(def: SurrealZodTableDef) {
//   const fields: Record<string, core.$ZodType> = {};
//   const fieldNames = Object.keys(def.fields);
//   if (!def.fields.id) {
//     fields.id = recordId(def.name).type(classic.any());
//     fieldNames.push("id");
//   } else if (def.fields.id._zod.traits.has("$ZodOptional")) {
//     if (
//       !def.dto ||
//       !(def.fields.id._zod.def.innerType instanceof ZodSurrealdRecordId)
//     ) {
//       throw new Error(
//         "Invalid table definition: When using .dto() we try to make the id field optional, " +
//           "the inner type must be a ZodSurrealRecordId but it is not. This is supposed to " +
//           "be impossible, likely an internal library error. Please open an issue at " +
//           "https://github.com/msanchezdev/surreal-zod/issues with a minimal reproduction.",
//       );
//     }
//     fields.id = def.fields.id;
//   } else if (def.fields.id instanceof ZodSurrealdRecordId) {
//     const base = def.fields.id.table(def.name);
//     fields.id = def.dto ? classic.optional(base) : base;
//   } else {
//     const base = recordId(def.name).type(def.fields.id);
//     fields.id = def.dto ? classic.optional(base) : base;
//   }

//   for (const field of fieldNames) {
//     if (field === "id") continue;
//     // if (!def.fields[field]?._zod.traits.has("SurrealZodType")) {
//     //   throw new Error(
//     //     `Invalid field definition for "${field}": expected a Surreal Zod schema`,
//     //   );
//     // }
//     fields[field] = def.fields[field];
//   }

//   return {
//     ...def,
//     fields,
//     fieldNames,
//     fieldNamesSet: new Set(fieldNames),
//   };
// }

// export const ZodSurrealTable: core.$constructor<ZodSurrealTable> =
//   core.$constructor("SurrealZodTable", (inst, def) => {
//     ZodSurrealType.init(inst, def);

//     const normalized = normalizeTableDef(def);
//     // @ts-expect-error - through normalization id is always present
//     inst._zod.def.fields = normalized.fields;
//     const catchall = normalized.catchall;
//     const table = new Table(def.name);

//     inst.name = (name) => {
//       return inst.clone({
//         ...inst._zod.def,
//         name,
//       }) as any;
//     };
//     inst.fields = (fields) => {
//       if (inst._zod.def.surreal.tableType === "relation") {
//         fields = {
//           in: inst._zod.def.fields.in ?? recordId().type(classic.any()),
//           out: inst._zod.def.fields.out ?? recordId().type(classic.any()),
//           ...fields,
//         };
//       }

//       return inst.clone({
//         ...inst._zod.def,
//         // @ts-expect-error - id may or may not be provided
//         fields,
//       }) as any;
//     };
//     // @ts-expect-error - type defined conditionally
//     inst.from = (from) => {
//       if (inst._zod.def.surreal.tableType !== "relation") {
//         throw new Error("Cannot call .from() on a non-relation table");
//       }

//       return inst.clone({
//         ...inst._zod.def,
//         fields: {
//           ...inst._zod.def.fields,
//           in: from instanceof ZodSurrealdRecordId ? from : recordId(from),
//         },
//       }) as any;
//     };
//     // @ts-expect-error - type defined conditionally
//     inst.to = (to) => {
//       if (inst._zod.def.surreal.tableType !== "relation") {
//         throw new Error("Cannot call .to() on a non-relation table");
//       }

//       return inst.clone({
//         ...inst._zod.def,
//         fields: {
//           ...inst._zod.def.fields,
//           out: to instanceof ZodSurrealdRecordId ? to : recordId(to),
//         },
//       }) as any;
//     };
//     // @ts-expect-error - type defined conditionally
//     inst.in = inst.from;
//     // @ts-expect-error - type defined conditionally
//     inst.out = inst.to;

//     inst.any = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         surreal: {
//           ...inst._zod.def.surreal,
//           tableType: "any",
//         },
//       }) as any;
//     };
//     inst.normal = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         surreal: {
//           ...inst._zod.def.surreal,
//           tableType: "normal",
//         },
//       }) as any;
//     };
//     inst.relation = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         fields: {
//           in: recordId().type(classic.any()),
//           out: recordId().type(classic.any()),
//           ...inst._zod.def.fields,
//         },
//         surreal: {
//           ...inst._zod.def.surreal,
//           tableType: "relation",
//         },
//       }) as any;
//     };
//     inst.comment = (comment) => {
//       return inst.clone({
//         ...inst._zod.def,
//         surreal: {
//           ...inst._zod.def.surreal,
//           comment,
//         },
//       }) as any;
//     };
//     inst.schemafull = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         catchall: classic.never(),
//         surreal: {
//           ...inst._zod.def.surreal,
//           schemafull: true,
//         },
//       }) as any;
//     };
//     inst.schemaless = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         catchall: classic.unknown(),
//         surreal: {
//           ...inst._zod.def.surreal,
//           schemafull: false,
//         },
//       }) as any;
//     };
//     inst.drop = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         surreal: {
//           ...inst._zod.def.surreal,
//           drop: true,
//         },
//       }) as any;
//     };
//     inst.nodrop = () => {
//       return inst.clone({
//         ...inst._zod.def,
//         surreal: {
//           ...inst._zod.def.surreal,
//           drop: false,
//         },
//       }) as any;
//     };
//     inst.record = () => inst._zod.def.fields.id;
//     inst.table = () => table;
//     inst.dto = () => {
//       return new classic.ZodObject({
//         type: "object",
//         shape: {
//           ...inst._zod.def.fields,
//           id: classic.optional(inst._zod.def.fields.id),
//         },
//         catchall: inst._zod.def.catchall,
//       }) as any;
//     };
//     // @ts-expect-error - overloaded
//     inst.toSurql = (statement = "define", options) =>
//       // @ts-expect-error - overloaded
//       tableToSurql(inst, statement, options);

//     // @ts-expect-error - false-positive
//     inst.extend = (extraFields) => {
//       if (!core.util.isPlainObject(extraFields)) {
//         throw new Error("Invalid input to extend: expected a plain object");
//       }

//       const checks = inst._zod.def.checks;
//       const hasChecks = checks && checks.length > 0;
//       if (hasChecks) {
//         throw new Error(
//           "Table schemas containing refinements cannot be extended. Use `.safeExtend()` instead.",
//         );
//       }

//       const mergedDef = core.util.mergeDefs(inst._zod.def, {
//         get fields() {
//           const fields = { ...inst._zod.def.fields, ...extraFields };
//           core.util.assignProp(this, "fields", fields); // self-caching
//           return fields;
//         },
//         checks: [],
//       });

//       return core.clone(inst, mergedDef);
//     };

//     // @ts-expect-error - false-positive
//     inst.safeExtend = (extraFields) => {
//       if (!core.util.isPlainObject(extraFields)) {
//         throw new Error("Invalid input to safeExtend: expected a plain object");
//       }
//       const def = {
//         ...inst._zod.def,
//         get fields() {
//           const fields = { ...inst._zod.def.fields, ...extraFields };
//           core.util.assignProp(this, "fields", fields); // self-caching
//           return fields;
//         },
//         checks: inst._zod.def.checks,
//       } as any;
//       return core.clone(inst, def);
//     };

//     inst.pick = (mask) => {
//       const currDef = inst._zod.def;

//       const def = core.util.mergeDefs(inst._zod.def, {
//         get fields() {
//           const newFields: Record<string, unknown> = {};
//           for (const key in mask) {
//             if (!(key in currDef.fields)) {
//               throw new Error(`Unrecognized key: "${key}"`);
//             }
//             if (!mask[key]) continue;
//             newFields[key] = currDef.fields[key]!;
//           }

//           core.util.assignProp(this, "fields", newFields); // self-caching
//           return newFields;
//         },
//         checks: [],
//       });

//       if ("id" in mask && mask.id === false) {
//         return new classic.ZodObject({
//           type: "object",
//           shape: def.fields,
//           catchall: def.catchall,
//         }) as any;
//       }

//       return core.clone(inst, def) as any;
//     };

//     inst.omit = (mask) => {
//       const currDef = inst._zod.def;

//       const def = core.util.mergeDefs(inst._zod.def, {
//         get fields() {
//           const newFields: Record<string, unknown> = { ...currDef.fields };
//           for (const key in mask) {
//             if (!(key in currDef.fields)) {
//               throw new Error(`Unrecognized key: "${key}"`);
//             }
//             if (!(mask as any)[key]) continue;

//             delete newFields[key];
//           }
//           core.util.assignProp(this, "fields", newFields); // self-caching
//           return newFields;
//         },
//         checks: [],
//       });

//       if ("id" in mask && mask.id === true) {
//         return new classic.ZodObject({
//           type: "object",
//           shape: def.fields,
//           catchall: def.catchall,
//         }) as any;
//       }

//       return core.clone(inst, def) as any;
//     };

//     inst.partial = (mask?: Record<string, boolean> | boolean) => {
//       const def = core.util.mergeDefs(inst._zod.def, {
//         get fields() {
//           const oldFields = inst._zod.def.fields;
//           const fields: Record<string, unknown> = { ...oldFields };

//           if (typeof mask === "object") {
//             for (const key in mask) {
//               if (!(key in oldFields)) {
//                 throw new Error(`Unrecognized key: "${key}"`);
//               }
//               if (!(mask as any)[key]) continue;
//               // if (oldShape[key]!._zod.optin === "optional") continue;
//               fields[key] = classic.ZodOptional
//                 ? new classic.ZodOptional({
//                     type: "optional",
//                     innerType: oldFields[key]! as any,
//                   })
//                 : oldFields[key]!;
//             }
//           } else {
//             for (const key in oldFields) {
//               if (key === "id" && mask !== true) continue;

//               // if (oldShape[key]!._zod.optin === "optional") continue;
//               fields[key] = classic.ZodOptional
//                 ? new classic.ZodOptional({
//                     type: "optional",
//                     innerType: oldFields[key]! as any,
//                   })
//                 : oldFields[key]!;
//             }
//           }

//           core.util.assignProp(this, "fields", fields); // self-caching
//           return fields;
//         },
//         checks: [],
//       });

//       if (
//         mask === true ||
//         (typeof mask === "object" && "id" in mask && mask.id === true)
//       ) {
//         return new classic.ZodObject({
//           type: "object",
//           shape: def.fields,
//           catchall: def.catchall,
//         }) as any;
//       }

//       return core.clone(inst, def) as any;
//     };

//     inst.required = (mask?: Record<string, boolean>) => {
//       const def = core.util.mergeDefs(inst._zod.def, {
//         get fields() {
//           const oldFields = inst._zod.def.fields;
//           const fields: Record<string, unknown> = { ...oldFields };

//           if (mask) {
//             for (const key in mask) {
//               if (!(key in fields)) {
//                 throw new Error(`Unrecognized key: "${key}"`);
//               }
//               if (!(mask as any)[key]) continue;
//               if (key === "id") continue;
//               // overwrite with non-optional
//               fields[key] = new classic.ZodNonOptional({
//                 type: "nonoptional",
//                 innerType: oldFields[key]! as any,
//               });
//             }
//           } else {
//             for (const key in oldFields) {
//               if (key === "id") continue;

//               // overwrite with non-optional
//               fields[key] = new classic.ZodNonOptional({
//                 type: "nonoptional",
//                 innerType: oldFields[key]! as any,
//               });
//             }
//           }

//           core.util.assignProp(this, "fields", fields); // self-caching
//           return fields;
//         },
//         checks: [],
//       });

//       return core.clone(inst, def) as any;
//     };

//     inst._zod.parse = (payload, ctx) => {
//       const input = payload.value;

//       if (!core.util.isObject(input)) {
//         payload.issues.push({
//           expected: "object",
//           code: "invalid_type",
//           input,
//           inst,
//         });
//         return payload;
//       }

//       payload.value = {};
//       const promises: Promise<any>[] = [];
//       const fields = normalized.fields;

//       for (const field of normalized.fieldNames) {
//         const schema = fields[field]!;

//         const result = schema._zod.run(
//           { value: input[field], issues: [] },
//           ctx,
//         );
//         if (result instanceof Promise) {
//           promises.push(
//             result.then((result) => {
//               handleFieldResult(result, payload, field, input);
//             }),
//           );
//         } else {
//           handleFieldResult(result, payload, field, input);
//         }
//       }

//       if (!catchall) {
//         return promises.length
//           ? Promise.all(promises).then(() => payload)
//           : payload;
//       }

//       return handleCatchall(promises, input, payload, ctx, normalized, inst);
//     };

//     return inst;
//   });

// export function table<Name extends string = string>(name: Name) {
//   return new ZodSurrealTable({
//     type: "any",
//     name,
//     // @ts-expect-error - id set in constructor
//     fields: {},
//     catchall: classic.unknown(),
//     dto: false,

//     surreal: {
//       type: "table",
//       tableType: "any",
//       schemafull: false,
//       drop: false,
//       comment: undefined,
//     },
//   }) as unknown as ZodSurrealTable<Name>;
// }

// export function normalTable<Name extends string = string>(name: Name) {
//   return table(name).normal();
// }

// type toRecordId<
//   T extends
//     | string
//     | string[]
//     | ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>,
// > = T extends string
//   ? T extends ZodSurrealdRecordId<infer N, infer I>
//     ? ZodSurrealdRecordId<N, I>
//     : ZodSurrealdRecordId<T>
//   : T extends string[]
//     ? ZodSurrealdRecordId<T[number]>
//     : T extends ZodSurrealdRecordId<string, ZodSurrealRecordIdValue>
//       ? T
//       : never;

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////                              //////////
//////////      ZodSurrealDuration      //////////
//////////                              //////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

export interface ZodSurrealDurationDef extends ZodSurrealTypeDef {
  surreal: {
    type: "duration";
  };
}

export interface ZodSurrealDurationInternals
  extends ZodSurrealTypeInternals<Duration, Duration> {
  def: ZodSurrealDurationDef;
}

export interface ZodSurrealDuration
  extends _ZodSurrealType<ZodSurrealDurationInternals>,
    ZodSurrealFieldMethods {}

export const ZodSurrealDuration: core.$constructor<ZodSurrealDuration> =
  core.$constructor("ZodSurrealDuration", (inst, def) => {
    ZodSurrealType.init(inst, def);
    // @ts-expect-error
    ZodSurrealField.init(inst, def);

    // surreal internals
    inst._zod.def.surreal.type = "duration";

    inst._zod.parse = (payload, ctx) => {
      if (payload.value instanceof Duration) {
        return payload;
      }

      payload.issues.push({
        code: "invalid_type",
        expected: "duration",
        input: null,
        inst,
      });

      return payload;
    };

    return inst;
  });

export function duration() {
  return new ZodSurrealDuration({
    type: "any",
    surreal: {
      type: "duration",
    },
  });
}

// export type SurrealZodTypes =
//   | ZodSurrealdRecordId
//   | ZodSurrealTable
//   | SurrealZodDuration;
