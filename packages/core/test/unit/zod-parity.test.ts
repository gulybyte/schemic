// recordId(TableDef) links, the `.or()`/`.and()` combinators, and the native-Zod passthrough
// (refine/superRefine/check/overwrite/transform/pipe/brand/readonly/describe/meta) — sz.* stays a
// drop-in for z.*, with DDL mapping to the wire/input type.

import { describe, expect, test } from "bun:test";
import { defineTable, emitTable, sz } from "../../src/index";

const field = (t: Parameters<typeof emitTable>[0], name: string): string =>
  emitTable(t)
    .split("\n")
    .find((l) => l.includes(` ${name} `))
    ?.trim()
    .replace(/ PERMISSIONS.*/, "") ?? "";

const User = defineTable("user", { id: sz.string(), name: sz.string() });
const Service = defineTable("service", { id: sz.string() });
const Post = defineTable("post", { id: sz.string() });

describe("recordId accepts table defs (no hardcoded names)", () => {
  test("single def, def array, and string back-compat", () => {
    const T = defineTable("t", {
      id: sz.string(),
      a: sz.recordId(User),
      b: sz.recordId([User, Service]),
      c: sz.recordId("user"),
      d: sz.recordId(["user", "service"]),
    });
    expect(field(T, "a")).toBe("DEFINE FIELD a ON TABLE t TYPE record<user>;");
    expect(field(T, "b")).toBe(
      "DEFINE FIELD b ON TABLE t TYPE record<user | service>;",
    );
    expect(field(T, "c")).toBe("DEFINE FIELD c ON TABLE t TYPE record<user>;");
    expect(field(T, "d")).toBe(
      "DEFINE FIELD d ON TABLE t TYPE record<user | service>;",
    );
  });
});

describe(".or() / .and() combinators (Zod parity)", () => {
  test(".or() unions; record links compose via .record().or()", () => {
    const T = defineTable("t", {
      id: sz.string(),
      u: sz.string().or(sz.int()),
      link: User.record().or(Post.record()),
    });
    expect(field(T, "u")).toBe("DEFINE FIELD u ON TABLE t TYPE string | int;");
    expect(field(T, "link")).toBe(
      "DEFINE FIELD link ON TABLE t TYPE record<user> | record<post>;",
    );
  });

  test(".or() composes with optional()", () => {
    const T = defineTable("t", {
      id: sz.string(),
      m: sz.recordId([User, Service]).optional(),
    });
    expect(field(T, "m")).toBe(
      "DEFINE FIELD m ON TABLE t TYPE option<record<user | service>>;",
    );
  });
});

describe("native Zod passthrough", () => {
  test("refine validates at runtime; the field's DDL type is unchanged", () => {
    const name = sz.string().refine((s) => s.length >= 2, "too short");
    expect(name.safeDecode("ab").success).toBe(true);
    expect(name.safeDecode("a").success).toBe(false);
    const T = defineTable("t", { id: sz.string(), name });
    expect(field(T, "name")).toBe("DEFINE FIELD name ON TABLE t TYPE string;");
  });

  test("a format's baked ASSERT survives a refine", () => {
    const T = defineTable("t", {
      id: sz.string(),
      email: sz.email().refine((s) => s.includes("@")),
    });
    expect(field(T, "email")).toBe(
      "DEFINE FIELD email ON TABLE t TYPE string ASSERT string::is_email($value);",
    );
  });

  test("transform changes the decoded value; DDL keeps the wire type", () => {
    const up = sz.string().transform((s) => s.toUpperCase());
    expect(up.decode("hi")).toBe("HI");
    const T = defineTable("t", { id: sz.string(), up });
    expect(field(T, "up")).toBe("DEFINE FIELD up ON TABLE t TYPE string;");
  });

  test("brand / readonly are app-side only — DDL maps to the base type", () => {
    const T = defineTable("t", {
      id: sz.string(),
      tag: sz.string().brand("Tag"),
      ro: sz.int().readonly(),
    });
    expect(field(T, "tag")).toBe("DEFINE FIELD tag ON TABLE t TYPE string;");
    expect(field(T, "ro")).toBe("DEFINE FIELD ro ON TABLE t TYPE int;");
  });
});
