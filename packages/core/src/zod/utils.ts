import type z from "zod";
import { core } from "zod";
import type { ParsingEncodingDecodingMethodNames } from "./parse";
import {
  ZodSurrealField,
  type ZodSurrealFieldMethods,
  type ZodSurrealTypeDefInternals,
  ZodSurrealType,
} from "./schema";

export type UnionToIntersection<U> = (
  U extends any
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;

export type LastOf<U> =
  UnionToIntersection<U extends any ? () => U : never> extends () => infer L
    ? L
    : never;

export type UnionToTuple<U, T extends any[] = []> = [U] extends [never]
  ? T
  : UnionToTuple<Exclude<U, LastOf<U>>, [LastOf<U>, ...T]>;

export type OverrideOutputInput<
  T extends core.$ZodType,
  O = unknown,
  I = unknown,
  DBO = O,
  DBI = I,
  SurrealInternals extends
    ZodSurrealTypeDefInternals = ZodSurrealTypeDefInternals,
> = Omit<
  T,
  | "_zod"
  | "_output"
  | "_input"
  | "~standard"
  | ParsingEncodingDecodingMethodNames
> & {
  "~standard": core.ZodStandardSchemaWithJSON<core.$ZodType<O, I>>;
  _zod: Omit<T["_zod"], "def" | "output" | "input"> & {
    def: T["_zod"]["def"] & {
      surreal: SurrealInternals;
    };
    output: O;
    input: I;
    dboutput: DBO;
    dbinput: DBI;
  };
  _output: O;
  _input: I;
};

type ZodTrait = {
  _zod: {
    def: any;
    [k: string]: any;
  };
};

export type _patch<
  T extends core.$ZodType,
  O = unknown,
  I = unknown,
  SurrealInternals extends
    ZodSurrealTypeDefInternals = ZodSurrealTypeDefInternals,
> = patch<T, O, I, O, I, SurrealInternals>;

export type patch<
  T extends core.$ZodType,
  O = unknown,
  I = unknown,
  DBO = O,
  DBI = I,
  SurrealInternals extends
    ZodSurrealTypeDefInternals = ZodSurrealTypeDefInternals,
> = Omit<
  T,
  | "_zod"
  | "_output"
  | "_input"
  | "~standard"
  | ParsingEncodingDecodingMethodNames
> &
  ZodSurrealFieldMethods<T> & {
    "~standard": core.ZodStandardSchemaWithJSON<core.$ZodType<O, I>>;
    _zod: Omit<T["_zod"], "def" | "output" | "input"> & {
      def: T["_zod"]["def"] & {
        surreal: SurrealInternals;
      };
      output: O;
      input: I;
      dboutput: DBO;
      dbinput: DBI;
    };
    _output: O;
    _input: I;
  };

export function patch<
  T extends core.$ZodType,
  P = unknown,
  I extends core.$ZodIssueBase = never,
>(options: {
  original: core.$constructor<ZodTrait>;
  name: string;
  extend?: core.$constructor<ZodTrait>[];

  patchDef?(def: T["_zod"]["def"]): void;

  beforeCheck?(payload: core.ParsePayload<P>): core.util.MaybeAsync<void>;
  afterCheck?(payload: core.ParsePayload<P>): core.util.MaybeAsync<void>;

  beforeParse?(
    payload: core.ParsePayload<P>,
    ctx: core.ParseContextInternal<I>,
  ): core.util.MaybeAsync<core.ParsePayload<P> | void>;

  beforeRun?(
    payload: core.ParsePayload<P>,
    ctx: core.ParseContextInternal<I>,
  ): core.util.MaybeAsync<core.ParsePayload<P> | void>;

  /**
   * Executed after a successful parsing and validation.
   */
  onRunSuccess?(result: core.ParsePayload<P>): void;
}): core.$constructor<
  T & ZodSurrealType<z.output<T>, z.input<T>> & ZodSurrealFieldMethods<T>
> {
  return core.$constructor(options.name, (inst, def) => {
    options.original.init(inst, def);
    ZodSurrealType.init(inst, def);
    // @ts-expect-error
    ZodSurrealField.init(inst, def);

    options.extend?.forEach((extend) => {
      // @ts-expect-error - extend is a constructor
      extend.init(inst, def);
    });

    options.patchDef?.(def);

    if (options.beforeCheck || options.afterCheck) {
      const _inst = inst as unknown as core.$ZodCheck;
      const originalCheck = _inst._zod.check;
      // // @ts-expect-error - we are overriding
      _inst._zod.check = (payload) => {
        options.beforeCheck?.(payload as core.ParsePayload<P>);
        originalCheck(payload);
        options.afterCheck?.(payload as core.ParsePayload<P>);
      };
    }

    if (options.beforeParse) {
      const originalParse = inst._zod.parse;
      // @ts-expect-error - we are overriding
      inst._zod.parse = (payload, ctx) => {
        const beforeParseResult = options?.beforeParse?.(
          payload as core.ParsePayload<P>,
          ctx as core.ParseContextInternal<I>,
        );
        if (beforeParseResult) {
          return beforeParseResult;
        }

        const result = originalParse(payload, ctx);
        return result;
      };
    }

    if (options.beforeRun || options.onRunSuccess) {
      const originalRun = inst._zod.run;
      // @ts-expect-error - we are overriding
      inst._zod.run = (payload, ctx) => {
        const beforeRunResult = options?.beforeRun?.(
          payload as core.ParsePayload<P>,
          ctx as core.ParseContextInternal<I>,
        );
        if (beforeRunResult) {
          return beforeRunResult;
        }

        const result = originalRun(payload, ctx);

        if (result instanceof Promise) {
          return result.then(async (result) => {
            if (!result.issues.length) {
              options?.onRunSuccess?.(result as core.ParsePayload<P>);
            }
            return result;
          });
        }
        if (!result.issues.length) {
          options?.onRunSuccess?.(result as core.ParsePayload<P>);
        }
        return result;
      };

      return inst;
    }
  });
}
