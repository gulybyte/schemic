import type * as core from "zod/v4/core";

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type OptionalOutSchema = { _zod: { optout: "optional" } };
export type OptionalDbOutSchema = { _zod: { dboptout: "optional" } };
export type OptionalInSchema = { _zod: { optin: "optional" } };
export type OptionalDbInSchema = { _zod: { dboptin: "optional" } };

export type $InferObjectDbOutput<
  T extends core.$ZodLooseShape,
  Extra extends Record<string, unknown>,
> = string extends keyof T
  ? core.util.IsAny<T[keyof T]> extends true
    ? Record<string, unknown>
    : Record<string, dboutput<T[keyof T]>>
  : keyof (T & Extra) extends never
    ? Record<string, never>
    : core.util.Prettify<
        {
          -readonly [k in keyof T as T[k] extends OptionalDbOutSchema
            ? never
            : k]: T[k]["_zod"]["dboutput"];
        } & {
          -readonly [k in keyof T as T[k] extends OptionalDbOutSchema
            ? k
            : never]?: T[k]["_zod"]["dboutput"];
        } & Extra
      >;

export type $InferObjectDbInput<
  T extends core.$ZodLooseShape,
  Extra extends Record<string, unknown>,
> = string extends keyof T
  ? core.util.IsAny<T[keyof T]> extends true
    ? Record<string, unknown>
    : Record<string, dbinput<T[keyof T]>>
  : keyof (T & Extra) extends never
    ? Record<string, never>
    : core.util.Prettify<
        {
          -readonly [k in keyof T as T[k] extends OptionalDbInSchema
            ? never
            : k]: T[k]["_zod"]["dbinput"];
        } & {
          -readonly [k in keyof T as T[k] extends OptionalDbInSchema
            ? k
            : never]?: T[k]["_zod"]["dbinput"];
        } & Extra
      >;

export type dbinput<T> = T extends { _zod: { dbinput: any } }
  ? T["_zod"]["dbinput"]
  : T extends { _zod: { input: any } }
    ? T["_zod"]["input"]
    : unknown;

export type dboutput<T> = T extends { _zod: { dboutput: any } }
  ? T["_zod"]["dboutput"]
  : T extends { _zod: { output: any } }
    ? T["_zod"]["output"]
    : unknown;
