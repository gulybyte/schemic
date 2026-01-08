import { expect } from "bun:test";
import getPort from "get-port";
import { Surreal } from "surrealdb";
export const surrealBin = Bun.which("surreal");
export const version = await getSurrealVersion();
if (!version.version.startsWith("3.")) {
    throw new Error("Only surrealdb 3 is supported");
}
async function getSurrealVersion() {
    if (!surrealBin) {
        throw new Error("No surreal binary found, please install surrealdb");
    }
    const match = /(?<version>.*?) for (?<platform>.*?) on (?<arch>.*?)\n/.exec(
    // @ts-expect-error - unknown bun typing error, but it works
    await Bun.spawn([surrealBin, "version"]).stdout.text());
    if (!match) {
        throw new Error("Failed to get surreal version");
    }
    return match?.groups;
}
export async function startSurrealTestInstance() {
    if (!surrealBin) {
        throw new Error("No surreal binary found, please install surrealdb");
    }
    const port = await getPort();
    const process = Bun.spawn({
        cmd: [
            surrealBin,
            "start",
            `--bind=127.0.0.1:${port}`,
            "--username=test",
            "--password=test",
        ],
        stdio: ["ignore", "ignore", "ignore"],
    });
    const surreal = new Surreal();
    await surreal.connect(`ws://127.0.0.1:${port}`, {
        authentication: {
            username: "test",
            password: "test",
        },
        namespace: "test",
        database: "test",
    });
    return {
        version,
        process,
        port,
        surreal,
        async close() {
            await surreal.close();
            process.kill("SIGTERM");
            await process.exited;
        },
    };
}
// Helper function to create a properly typed test case
export const testCase = (test) => test;
export const issues = (issues) => expect.objectContaining({
    issues: expect.arrayContaining(issues),
});
export const issue = {
    invalid_type: (expected, extras) => expect.objectContaining({
        code: "invalid_type",
        expected,
        ...extras,
    }),
    invalid_union: (...unionIssues) => expect.objectContaining({
        code: "invalid_union",
        errors: expect.arrayContaining(unionIssues.map((issues) => expect.arrayContaining(issues))),
    }),
    invalid_format: (format, extras) => expect.objectContaining({
        code: "invalid_format",
        format,
        ...extras,
        ...(extras?.pattern ? { pattern: extras.pattern.source } : {}),
    }),
    too_big: (maximum) => expect.objectContaining({
        code: "too_big",
        maximum,
    }),
    too_small: (minimum) => expect.objectContaining({
        code: "too_small",
        minimum,
    }),
    unrecognized_keys: (keys) => expect.objectContaining({
        code: "unrecognized_keys",
        keys,
    }),
    missing_keys: (keys) => expect.objectContaining({
        code: "missing_keys",
        keys,
    }),
    invalid_value: (values, extras) => expect.objectContaining({
        code: "invalid_value",
        values,
        ...extras,
    }),
};
