import { describe, expect, test } from "bun:test";
import { setupSurrealTests } from "./common";
import z from "../src";
import { testCase } from "./utils";
import { DateTime, surql, toSurqlString } from "surrealdb";

describe("fields", () => {
  const { defineTest } = setupSurrealTests();

  const schema = z.date();
  defineTest("$default()", schema.$default(surql`time::now()`), {
    type: "datetime",
    default: {
      value: "time::now()",
    },
    tests: [
      testCase({
        value: undefined,
        parse: undefined,
        check(value) {
          expect(value).toBeInstanceOf(DateTime);
        },
      }),
    ],
  });

  const defaultDate = new Date("2026-01-01T12:00:00.000Z");
  defineTest("$default()", schema.$default(defaultDate), {
    type: "datetime",
    default: {
      value: toSurqlString(defaultDate),
    },
    tests: [
      testCase({
        value: undefined,
        parse: undefined,
        equals: new DateTime(defaultDate),
      }),
    ],
  });

  defineTest("$comment()", schema.$comment("Date field"), {
    type: "datetime",
    comment: "Date field",
  });

  defineTest("$readonly()", schema.$readonly(), {
    type: "datetime",
    readonly: true,
  });

  defineTest("$value()", schema.$value(surql`$value ?? time::now()`), {
    type: "datetime",
    value: "$value ?? time::now()",
  });

  defineTest("$assert()", schema.$assert(surql`$value > time::now()`), {
    type: "datetime",
    assert: "$value > time::now()",
  });

  defineTest("unwrap()", schema.$comment("Test").unwrap(), {
    type: "datetime",
  });
});
