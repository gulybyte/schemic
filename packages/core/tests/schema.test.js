import { describe, expect, expectTypeOf, test, } from "bun:test";
import { Duration, RecordId, StringRecordId, } from "surrealdb";
import sz from "../src";
const suites = {
    string: {
        simple: "Hello World",
        empty: "",
    },
    number: {
        positive: 123,
        negative: -123,
        decimal: 123.456,
        zero: 0,
        max_int: Number.MAX_SAFE_INTEGER,
        min_int: Number.MIN_SAFE_INTEGER,
    },
    bigint: {
        positive: 123n,
        negative: -123n,
    },
    boolean: {
        true: true,
        false: false,
    },
    null: {
        simple: null,
    },
    undefined: {
        simple: undefined,
    },
    array: {
        empty: [],
        basic: [1, 2, 3],
        nested: [
            [1, 2, 3],
            [4, 5, 6],
        ],
    },
    object: {
        basic: {
            name: "John Doe",
            age: 17,
        },
        nested: {
            name: "John Doe",
            age: 17,
            meta: {
                created: new Date(),
                version: 1,
                deleted: false,
            },
        },
    },
    recordId: {
        basic: new RecordId("user", "123"),
        different_table: new RecordId("test", "123"),
        different_type: new RecordId("user", 123),
    },
};
const all = (tests) => {
    const toExecute = {};
    for (const suiteName of Object.keys(suites)) {
        toExecute[suiteName] = {};
        if (typeof tests?.[suiteName] === "boolean") {
            for (const testCase in suites[suiteName]) {
                toExecute[suiteName][testCase] = tests?.[suiteName] ?? true;
            }
        }
        else {
            for (const testCase of Object.keys(suites[suiteName])) {
                toExecute[suiteName][testCase] = tests?.[suiteName]?.[testCase] ?? true;
            }
        }
    }
    return toExecute;
};
const none = (tests) => {
    const toExecute = {};
    for (const suiteName of Object.keys(suites)) {
        toExecute[suiteName] = {};
        if (typeof tests?.[suiteName] === "boolean") {
            for (const testCase in suites[suiteName]) {
                toExecute[suiteName][testCase] = tests?.[suiteName] ?? false;
            }
        }
        else {
            for (const testCase of Object.keys(suites[suiteName])) {
                toExecute[suiteName][testCase] =
                    tests?.[suiteName]?.[testCase] ?? false;
            }
        }
    }
    return toExecute;
};
const but = {
    pass: {
        expecting: (testcase, patch) => {
            return {
                __but__: {
                    pass: true,
                    expected: patch(structuredClone(testcase)),
                },
            };
        },
    },
    fail: {
        with: (error) => {
            return {
                __but__: {
                    pass: false,
                    error,
                },
            };
        },
    },
    dontPatch: (value) => {
        return {
            __but__: {
                dontPatch: value,
            },
        };
    },
};
function testSchema(name, schema, shouldMatch) {
    describe(name, () => {
        // console.log(name, shouldMatch);
        for (const [suiteName, suite] of Object.entries(suites)) {
            for (const [testcaseName, testcaseValue] of Object.entries(suite)) {
                const title = `${suiteName}.${testcaseName}`;
                test(`= ${title}`, () => {
                    // biome-ignore lint/suspicious/noExplicitAny: _
                    const override = shouldMatch[suiteName]?.[testcaseName]?.[
                    // biome-ignore lint/complexity/useLiteralKeys: _
                    "__but__"]
                        ? // biome-ignore lint/complexity/useLiteralKeys: _
                            shouldMatch[suiteName]?.[testcaseName]?.["__but__"]
                        : undefined;
                    const shouldPass = override?.pass ?? shouldMatch[suiteName]?.[testcaseName];
                    if (shouldPass) {
                        const parse = schema.safeParse(testcaseValue);
                        expect(parse).toMatchObject({
                            success: true,
                            data: override?.expected ?? testcaseValue,
                        });
                    }
                    else {
                        const parse = schema.safeParse(testcaseValue);
                        let received = typeof testcaseValue;
                        if (testcaseValue === null) {
                            received = "null";
                        }
                        else if (testcaseValue === undefined) {
                            received = "undefined";
                        }
                        else if (received === "object") {
                            if (Array.isArray(testcaseValue)) {
                                received = "array";
                            }
                            else if (testcaseValue instanceof RecordId) {
                                received = "RecordId";
                            }
                        }
                        expect(parse).toMatchObject({
                            success: false,
                            error: override?.error ??
                                expect.objectContaining({
                                    issues: expect.arrayContaining([
                                        expect.objectContaining({
                                            code: "invalid_type",
                                        }),
                                    ]),
                                }),
                        });
                    }
                });
            }
        }
    });
}
function _patch(tests, patch) {
    const patched = {};
    // clone tests
    for (const [suiteName, suite] of Object.entries(tests)) {
        patched[suiteName] = {};
        for (const [testcaseName, testcaseValue] of Object.entries(suite)) {
            patched[suiteName][testcaseName] = testcaseValue;
        }
    }
    // patch tests
    for (const [suiteName, suite] of Object.entries(tests)) {
        for (const [testcaseName, _testcaseValue] of Object.entries(suite)) {
            if (
            // biome-ignore lint/suspicious/noExplicitAny: _
            tests[suiteName]?.[testcaseName]?.__but__ &&
                // biome-ignore lint/suspicious/noExplicitAny: _
                tests[suiteName]?.[testcaseName].__but__.dontPatch !==
                    undefined) {
                // biome-ignore lint/suspicious/noExplicitAny: _
                patched[suiteName][testcaseName] = tests[suiteName]?.[testcaseName].__but__?.dontPatch;
                // biome-ignore lint/suspicious/noExplicitAny: _
            }
            else if (typeof patch[suiteName] === "boolean") {
                // biome-ignore lint/suspicious/noExplicitAny: _
                patched[suiteName][testcaseName] = patch[suiteName];
            }
            else if (
            // biome-ignore lint/suspicious/noExplicitAny: _
            typeof patch[suiteName]?.[testcaseName] === "boolean") {
                // biome-ignore lint/suspicious/noExplicitAny: _
                patched[suiteName][testcaseName] = patch[suiteName]?.[testcaseName];
            }
        }
    }
    return patched;
}
describe("surreal-zod", () => {
    for (const { name, wrap, patch } of [
        {
            name: "",
            wrap: (schema) => schema,
            patch: (tests) => _patch(tests, tests),
        },
        {
            name: "optional",
            wrap: (schema) => sz.optional(schema),
            patch: (tests) => _patch(tests, {
                undefined: true,
            }),
        },
        {
            name: "nonoptional",
            wrap: (schema) => sz.nonoptional(schema),
            patch: (tests) => _patch(tests, {
                undefined: false,
            }),
        },
        {
            name: "nullable",
            wrap: (schema) => sz.nullable(schema),
            patch: (tests) => _patch(tests, {
                null: true,
            }),
        },
        {
            name: "nullish",
            wrap: (schema) => sz.nullish(schema),
            patch: (tests) => _patch(tests, {
                undefined: true,
                null: true,
            }),
        },
    ]) {
        (name ? describe : (_name, fn) => fn())(name, () => {
            testSchema("any", wrap(sz.any()), patch(all({})));
            testSchema("unknown", wrap(sz.unknown()), patch(all({})));
            testSchema("never", wrap(sz.never()), patch(none({})));
            testSchema("boolean", wrap(sz.boolean()), patch(none({ boolean: true })));
            testSchema("string", wrap(sz.string()), patch(none({ string: true })));
            testSchema("number", wrap(sz.number()), patch(none({ number: true })));
            testSchema("bigint", wrap(sz.bigint()), patch(none({ bigint: true })));
            testSchema("null", wrap(sz.null()), patch(none({ null: true })));
            testSchema("undefined", wrap(sz.undefined()), patch(none({ undefined: true })));
            // testSchema("array", sz.array(sz.number()), none({ array: true }));
            testSchema("object", wrap(sz.object({
                name: sz.string(),
                age: sz.number(),
            })), patch(none({
                object: {
                    basic: true,
                    nested: but.pass.expecting(suites.object.nested, (testcase) => {
                        // @ts-expect-error - not undefined
                        delete testcase.meta;
                        return testcase;
                    }),
                },
            })));
            testSchema("loose object", wrap(sz.object({
                name: sz.string(),
                age: sz.number(),
                meta: sz.object().loose(),
            })), patch(none({
                object: {
                    basic: false,
                    nested: true,
                },
            })));
            testSchema("strict object", wrap(sz.object({
                name: sz.string(),
                age: sz.number(),
                meta: sz
                    .object({
                    created: sz.any(),
                    deleted: sz.boolean(),
                })
                    .strict(),
            })), patch(none({
                object: {
                    basic: false,
                    nested: (() => {
                        switch (name) {
                            default: {
                                return but.fail.with(expect.objectContaining({
                                    issues: expect.arrayContaining([
                                        expect.objectContaining({
                                            code: "unrecognized_keys",
                                            keys: ["version"],
                                        }),
                                    ]),
                                }));
                            }
                        }
                    })(),
                },
            })));
            testSchema("recordId", wrap(sz.recordId(["user", "admin"]).type(sz.string())), patch(none({
                recordId: {
                    basic: true,
                    different_type: false,
                    different_table: but.fail.with(expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user", "admin"],
                            }),
                        ]),
                    })),
                },
            })));
        });
    }
    describe("recordId", () => {
        test("type is overriden", () => {
            const schema = sz.recordId(["user", "admin"]).type(sz.string());
            let parse = sz.safeParse(schema, new RecordId("user", "123"));
            expect(parse).toMatchObject({
                success: true,
                data: new RecordId("user", "123"),
            });
            parse = sz.safeParse(schema, new RecordId("test", 123));
            expect(parse.success).toBeFalse();
            expect(parse.error?.message).toMatch(/expected string, received number/i);
        });
        test("table is overriden", () => {
            let schema = sz.recordId([
                "user",
                "admin",
            ]);
            let parse = sz.safeParse(schema, new RecordId("user", "123"));
            expect(parse).toMatchObject({
                success: true,
                data: new RecordId("user", "123"),
            });
            parse = sz.safeParse(schema, new RecordId("test", "123"));
            expect(parse.success).toBeFalse();
            expect(parse.error?.message).toMatch(/Expected RecordId's table to be one of user \| admin but found test/i);
            schema = schema.table("test");
            parse = sz.safeParse(schema, new RecordId("test", "123"));
            expect(parse).toMatchObject({
                success: true,
                data: new RecordId("test", "123"),
            });
            parse = sz.safeParse(schema, new RecordId("admin", "123"));
            expect(parse.success).toBeFalse();
            expect(parse.error?.message).toMatch(/Expected RecordId's table to be test but found admin/i);
        });
        test("anytable", () => {
            let schema = sz.recordId(["user", "admin"]);
            let parse = sz.safeParse(schema, new RecordId("test", "123"));
            expect(parse).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    issues: expect.arrayContaining([
                        expect.objectContaining({
                            code: "invalid_value",
                            values: ["user", "admin"],
                        }),
                    ]),
                }),
            });
            schema = schema.anytable();
            parse = sz.safeParse(schema, new RecordId("test", "123"));
            expect(parse).toMatchObject({
                success: true,
                data: new RecordId("test", "123"),
            });
        });
        describe("from RecordId", () => {
            test("any table, any value", () => {
                const schema = sz.recordId();
                expect(schema.safeDecode(new RecordId("user", "123"))).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
                expect(schema.safeDecode(new RecordId("test", "123"))).toMatchObject({
                    success: true,
                    data: new RecordId("test", "123"),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                // safeDecode
                expectTypeOf(schema.safeDecode).returns.toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                // safeDecodeAsync
                expectTypeOf(schema.safeDecodeAsync).returns.toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
            });
            test("any table, typed value", () => {
                const schema = sz.recordId().type(sz.number());
                expect(schema.safeDecode(new RecordId("user", 123))).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeDecode(new RecordId("test", 123))).toMatchObject({
                    success: true,
                    data: new RecordId("test", 123),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                // safeDecode
                expectTypeOf(schema.safeDecode).returns.toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                // safeDecodeAsync
                expectTypeOf(schema.safeDecodeAsync).returns.toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
            });
            test("specific table, any value", () => {
                const schema = sz.recordId("user");
                expect(schema.safeDecode(new RecordId("user", "123"))).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
                expect(schema.safeDecode(new RecordId("test", "123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user"],
                            }),
                        ]),
                    }),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                // safeDecode
                expectTypeOf(schema.safeDecode).returns.toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                // safeDecodeAsync
                expectTypeOf(schema.safeDecodeAsync).returns.toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
            });
            test("specific table, typed value", () => {
                const schema = sz.recordId("user").type(sz.number());
                expect(schema.safeDecode(new RecordId("user", 123))).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeDecode(new RecordId("test", 123))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user"],
                            }),
                        ]),
                    }),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                // safeDecode
                expectTypeOf(schema.safeDecode).returns.toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                // safeDecodeAsync
                expectTypeOf(schema.safeDecodeAsync).returns.toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
            });
            test("multiple tables, any value", () => {
                const schema = sz.recordId(["user", "admin"]);
                expect(schema.safeDecode(new RecordId("user", "123"))).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
                expect(schema.safeDecode(new RecordId("admin", "123"))).toMatchObject({
                    success: true,
                    data: new RecordId("admin", "123"),
                });
                expect(schema.safeDecode(new RecordId("test", "123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user", "admin"],
                            }),
                        ]),
                    }),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
            });
            test("multiple tables, typed value", () => {
                const schema = sz.recordId(["user", "admin"]).type(sz.number());
                expect(schema.safeDecode(new RecordId("user", 123))).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeDecode(new RecordId("admin", 123))).toMatchObject({
                    success: true,
                    data: new RecordId("admin", 123),
                });
                expect(schema.safeDecode(new RecordId("test", "123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user", "admin"],
                            }),
                        ]),
                    }),
                });
                // TODO: StringRecordId is not supported yet
                expect(schema.safeDecode(new StringRecordId("user:123"))).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "record_id",
                            }),
                        ]),
                    }),
                });
                // -------------------------- Type Tests --------------------------
                // parse
                expectTypeOf(schema.parse).returns.toExtend();
                expectTypeOf(schema.parse(new RecordId("user", 123))).toExtend();
                // parseAsync
                expectTypeOf(schema.parseAsync).returns.toExtend();
                expectTypeOf(schema.parseAsync(new RecordId("user", 123))).toExtend();
                // safeParse
                expectTypeOf(schema.safeParse).returns.toExtend();
                expectTypeOf(schema.safeParse(new RecordId("user", 123))).toExtend();
                // safeParseAsync
                expectTypeOf(schema.safeParseAsync).returns.toExtend();
                expectTypeOf(schema.safeParseAsync(new RecordId("user", 123))).toExtend();
                // decode
                expectTypeOf(schema.decode).returns.toExtend();
                expectTypeOf(schema.decode(new RecordId("user", 123))).toExtend();
                // decodeAsync
                expectTypeOf(schema.decodeAsync).returns.toExtend();
                expectTypeOf(schema.decodeAsync(new RecordId("user", 123))).toExtend();
                // safeDecode
                expectTypeOf(schema.safeDecode).returns.toExtend();
                expectTypeOf(schema.safeDecode(new RecordId("user", 123))).toExtend();
                // safeDecodeAsync
                expectTypeOf(schema.safeDecodeAsync).returns.toExtend();
                expectTypeOf(schema.safeDecodeAsync(new RecordId("user", 123))).toExtend();
            });
        });
        describe("from parts", () => {
            test("any table, any value", () => {
                const schema = sz.recordId();
                expect(schema.safeFromParts("user", "123")).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
            });
            test("any table, typed value", () => {
                const schema = sz.recordId().type(sz.number());
                expect(schema.safeFromParts("user", 123)).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeFromParts("test", "123")).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_type",
                                expected: "number",
                            }),
                        ]),
                    }),
                });
            });
            test("specific table, any value", () => {
                const schema = sz.recordId("user");
                expect(schema.safeFromParts("user", "123")).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
                expect(schema.safeFromParts("admin", "123")).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user"],
                            }),
                        ]),
                    }),
                });
            });
            test("specific table, typed value", () => {
                const schema = sz.recordId("user").type(sz.number());
                expect(schema.safeFromParts("user", 123)).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeFromParts("test", 123)).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user"],
                            }),
                        ]),
                    }),
                });
            });
            test("multiple tables, any value", () => {
                const schema = sz.recordId(["user", "admin"]);
                expect(schema.safeFromParts("user", "123")).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
                expect(schema.safeFromParts("test", "123")).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user", "admin"],
                            }),
                        ]),
                    }),
                });
            });
            test("multiple tables, typed value", () => {
                const schema = sz.recordId(["user", "admin"]).type(sz.number());
                expect(schema.safeFromParts("user", 123)).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
                expect(schema.safeFromParts("test", 123)).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user", "admin"],
                            }),
                        ]),
                    }),
                });
            });
        });
        describe("from id", () => {
            test("any table, any value", () => {
                const schema = sz.recordId();
                // @ts-expect-error - from id not allowed
                expect(schema.safeFromId).toBeUndefined();
            });
            test("any table, typed value", () => {
                const schema = sz.recordId().type(sz.number());
                // @ts-expect-error - from id not allowed
                expect(schema.safeFromId).toBeUndefined();
            });
            test("specific table, any value", () => {
                const schema = sz.recordId("user");
                expect(schema.safeFromId("123")).toMatchObject({
                    success: true,
                    data: new RecordId("user", "123"),
                });
            });
            test("specific table, typed value", () => {
                const schema = sz.recordId("user").type(sz.number());
                expect(schema.safeFromId(123)).toMatchObject({
                    success: true,
                    data: new RecordId("user", 123),
                });
            });
            test("multiple tables, any value", () => {
                const schema = sz.recordId(["user", "admin"]);
                // @ts-expect-error - from id not allowed
                expect(schema.safeFromId).toBeUndefined();
            });
            test("multiple table, typed value", () => {
                const schema = sz.recordId(["user", "admin"]).type(sz.number());
                // @ts-expect-error - from id not allowed
                expect(schema.safeFromId).toBeUndefined();
            });
        });
    });
    describe("table", () => {
        test("fails if not an object", () => {
            const schema = sz.table("test").fields({
                name: sz.string(),
            });
            expect(sz.safeParse(schema, "Hello World")).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.stringMatching(/expected object, received string/i),
                }),
            });
            expect(sz.safeParse(schema, null)).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.stringMatching(/expected object, received null/i),
                }),
            });
            expect(sz.safeParse(schema, 123)).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.stringMatching(/expected object, received number/i),
                }),
            });
            expect(sz.safeParse(schema, true)).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.stringMatching(/expected object, received boolean/i),
                }),
            });
        });
        test("fails if id does not match table name", () => {
            const schema = sz.table("user").schemaless().fields({
                name: sz.string(),
            });
            const parse = sz.safeParse(schema, {
                id: new RecordId("test", 123),
                name: "John Doe",
                age: 99,
            });
            expect(parse).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.stringMatching(/Expected RecordId's table to be user but found test/i),
                }),
            });
        });
        test("id's table is overriden if already set", () => {
            const schema = sz.table("user").fields({
                id: sz.recordId(["test", "admin"]),
            });
            expect(sz.safeParse(schema, {
                id: new RecordId("test", 123),
            })).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    issues: expect.arrayContaining([
                        expect.objectContaining({
                            code: "invalid_value",
                            values: ["user"],
                            path: ["id"],
                        }),
                    ]),
                    message: expect.stringMatching(/Expected RecordId's table to be user but found test/i),
                }),
            });
        });
        test("fails if id is not provided", () => {
            const schema = sz.table("user").fields({
                name: sz.string(),
            });
            const parse = sz.safeParse(schema, {
                name: "John Doe",
                age: 99,
            });
            expect(parse).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    issues: expect.arrayContaining([
                        expect.objectContaining({
                            code: "invalid_type",
                            path: ["id"],
                            expected: "record_id",
                        }),
                    ]),
                }),
            });
        });
        test("allow extra fields if schemaless", () => {
            const schema = sz.table("user").schemaless().fields({
                name: sz.string(),
            });
            const parse = sz.safeParse(schema, {
                id: new RecordId("user", 123),
                name: "John Doe",
                age: 99,
            });
            expect(parse).toMatchObject({
                success: true,
                data: {
                    name: "John Doe",
                    age: 99,
                },
            });
        });
        test("deny extra fields if schemafull", () => {
            const schema = sz.table("user").schemafull().fields({
                name: sz.string(),
            });
            const parse = sz.safeParse(schema, {
                id: new RecordId("user", "213"),
                name: "John Doe",
                age: 99,
            });
            expect(parse).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    issues: expect.arrayContaining([
                        expect.objectContaining({
                            code: "unrecognized_keys",
                            keys: ["age"],
                        }),
                    ]),
                }),
            });
        });
        test("fail on missing fields", () => {
            const schema = sz.table("test").fields({
                name: sz.string(),
                age: sz.string(),
            });
            const parse = sz.safeParse(schema, {
                id: new RecordId("test", "123"),
            });
            expect(parse).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    issues: expect.arrayContaining([
                        expect.objectContaining({
                            code: "invalid_type",
                            path: ["name"],
                            expected: "string",
                        }),
                        expect.objectContaining({
                            code: "invalid_type",
                            path: ["age"],
                            expected: "string",
                        }),
                    ]),
                }),
            });
        });
        describe("record()", () => {
            test("matches table's id type", () => {
                const schema = sz.table("test").record();
                let parse = sz.safeParse(schema, new RecordId("test", "123"));
                expect(parse).toMatchObject({
                    success: true,
                    data: new RecordId("test", "123"),
                });
                parse = sz.safeParse(schema, new RecordId("user", "123"));
                expect(parse).toMatchObject({
                    success: false,
                    error: expect.any(Error),
                });
            });
            test("original id schema is preserved", () => {
                const schema = sz
                    .table("test")
                    .fields({
                    id: sz.string(),
                    name: sz.string(),
                })
                    .record();
                let parse = sz.safeParse(schema, new RecordId("test", "123"));
                expect(parse).toMatchObject({
                    success: true,
                    data: new RecordId("test", "123"),
                });
                parse = sz.safeParse(schema, new RecordId("user", "123"));
                expect(parse).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["test"],
                            }),
                        ]),
                    }),
                });
            });
        });
        describe("dto()", () => {
            test("id is optional", () => {
                const schema = sz
                    .table("user")
                    .fields({
                    name: sz.string(),
                })
                    .dto();
                const parse = sz.safeParse(schema, {
                    name: "John Doe",
                });
                expect(parse).toMatchObject({
                    success: true,
                    data: {
                        name: "John Doe",
                    },
                });
            });
            test("original id schema is preserved", () => {
                const schema = sz
                    .table("user")
                    .fields({
                    name: sz.string(),
                })
                    .dto();
                let parse = sz.safeParse(schema, {
                    id: new RecordId("user", "123"),
                    name: "John Doe",
                });
                expect(parse).toMatchObject({
                    success: true,
                    data: {
                        id: new RecordId("user", "123"),
                        name: "John Doe",
                    },
                });
                parse = sz.safeParse(schema, {
                    id: new RecordId("test", "456"),
                    name: "John Doe",
                });
                expect(parse).toMatchObject({
                    success: false,
                    error: expect.objectContaining({
                        issues: expect.arrayContaining([
                            expect.objectContaining({
                                code: "invalid_value",
                                values: ["user"],
                            }),
                        ]),
                    }),
                });
            });
        });
    });
    describe("duration", () => {
        test("matches duration type", () => {
            const schema = sz.duration();
            const parse = sz.safeParse(schema, new Duration("1y"));
            expect(parse.data?.equals(new Duration("1y"))).toBeTrue();
        });
    });
});
