import { Surreal } from "surrealdb";
export declare const surrealBin: string | null;
export declare const version: {
    version: string;
    platform: string;
    arch: string;
};
export declare function startSurrealTestInstance(): Promise<{
    version: {
        version: string;
        platform: string;
        arch: string;
    };
    process: Bun.Subprocess<"ignore", "ignore", "ignore">;
    port: number;
    surreal: Surreal;
    close(): Promise<void>;
}>;
export type TestCase<I = any, P = I> = {
    value: I;
    parse?: {
        data: P;
    } | {
        error: any;
    };
    equals?: P;
} | {
    value: P;
    parse?: {
        data: P;
    } | {
        error: any;
    };
    matches: any;
} | {
    value: P;
    parse?: {
        data: P;
    } | {
        error: any;
    };
    check(value: P): void | Promise<void>;
} | {
    value: P;
    parse?: {
        data: P;
    } | {
        error: any;
    };
    error: Error | string | RegExp;
};
export type ZodTest = {
    type?: string;
    async?: boolean;
    default?: {
        value: any;
        always?: boolean;
    };
    children?: TestCaseChildField[];
    asserts?: string[];
    transforms?: string[];
    schemafull?: boolean;
    debug?: boolean;
    tests?: readonly TestCase<any>[];
    error?: any;
};
export type TestCaseChildField = {
    name: string;
    type: string;
    default?: {
        value: any;
        always?: boolean;
    };
    asserts?: string[];
    transforms?: string[];
    children?: TestCaseChildField[];
};
export declare const testCase: <I = any, P = I>(test: TestCase<I, P>) => TestCase<I, P>;
export declare const issues: (issues: any[]) => any;
export declare const issue: {
    invalid_type: (expected: string, extras?: {
        path?: string[];
    }) => any;
    invalid_union: (...unionIssues: any[]) => any;
    invalid_format: (format: string, extras?: {
        origin?: string;
        pattern?: RegExp;
        message?: string;
    }) => any;
    too_big: (maximum: number | bigint) => any;
    too_small: (minimum: number | bigint) => any;
    unrecognized_keys: (keys: string[]) => any;
    missing_keys: (keys: string[]) => any;
    invalid_value: (values: string[], extras?: {
        path?: string[];
    }) => any;
};
export type TestInstance = Awaited<ReturnType<typeof startSurrealTestInstance>>;
