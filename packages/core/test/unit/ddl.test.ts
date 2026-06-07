import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { surql } from "surrealdb";
import { defineField, defineTable, renderPermissions } from "../../src/ddl";
import { relation, SField, sz, table, type Shape, type TableDef } from "../../src/pure";

/** DDL for a single standalone field `x` on table `t`. */
const ddl = (field: SField, opts?: Parameters<typeof defineField>[3]) =>
  defineField("x", "t", field, opts);
/** The bare SurrealQL type a field infers to (for leaf-type assertions). */
const typeOf = (field: SField) => {
  const m = ddl(field).match(/TYPE (.+);$/);
  if (!m) throw new Error(`no TYPE in: ${ddl(field)}`);
  return m[1];
};

describe("leaf types", () => {
  test("primitives", () => {
    expect(typeOf(sz.string())).toBe("string");
    expect(typeOf(sz.number())).toBe("number");
    expect(typeOf(sz.boolean())).toBe("bool");
    expect(typeOf(sz.null())).toBe("null");
    expect(typeOf(sz.any())).toBe("any");
    expect(typeOf(sz.unknown())).toBe("any");
  });

  test("numbers discriminate int vs float by format", () => {
    expect(typeOf(sz.int())).toBe("int");
    expect(typeOf(sz.int32())).toBe("int");
    expect(typeOf(sz.uint32())).toBe("int");
    expect(typeOf(sz.bigint())).toBe("int");
    expect(typeOf(sz.float())).toBe("float");
  });

  test("string formats all collapse to string", () => {
    expect(typeOf(sz.email())).toBe("string");
    expect(typeOf(sz.url())).toBe("string");
    expect(typeOf(sz.ulid())).toBe("string");
    expect(typeOf(sz.ipv4())).toBe("string");
    expect(typeOf(sz.jwt())).toBe("string");
  });

  test("surreal-native types", () => {
    expect(typeOf(sz.datetime())).toBe("datetime");
    expect(typeOf(sz.date())).toBe("datetime");
    expect(typeOf(sz.uuid())).toBe("uuid");
    expect(typeOf(sz.bytes())).toBe("bytes");
    expect(typeOf(sz.duration())).toBe("duration");
    expect(typeOf(sz.decimal())).toBe("decimal");
    expect(typeOf(sz.file())).toBe("file");
    expect(typeOf(sz.geometry())).toBe("geometry");
    expect(typeOf(sz.geometry("point"))).toBe("geometry<point>");
  });

  test("record links", () => {
    expect(typeOf(sz.recordId("user"))).toBe("record<user>");
    expect(typeOf(sz.recordId(["user", "admin"]))).toBe("record<user | admin>");
  });
});

describe("wrappers", () => {
  test("optional -> option<>", () => {
    expect(typeOf(sz.string().optional())).toBe("option<string>");
    expect(typeOf(sz.int().optional())).toBe("option<int>");
  });

  test("zod .default() -> option<> (the value lives app-side, not in DDL)", () => {
    expect(ddl(sz.string().default("x"))).toBe("DEFINE FIELD x ON TABLE t TYPE option<string>;");
  });

  test("nullable -> T | null", () => {
    expect(typeOf(sz.string().nullable())).toBe("string | null");
  });

  test("nullish / .optional().nullable() / .nullable().optional() all -> option<T | null>", () => {
    expect(typeOf(sz.string().nullish())).toBe("option<string | null>");
    expect(typeOf(sz.string().optional().nullable())).toBe("option<string | null>");
    expect(typeOf(sz.string().nullable().optional())).toBe("option<string | null>");
  });

  test("prefault -> option<> (app-side default); catch is transparent", () => {
    expect(typeOf(sz.string().prefault("x"))).toBe("option<string>");
    expect(typeOf(sz.string().catch("x"))).toBe("string");
  });

  test("array / set", () => {
    expect(typeOf(sz.string().array())).toBe("array<string>");
    expect(typeOf(sz.set(sz.int()))).toBe("array<int>");
  });
});

describe("DB-side metadata clauses", () => {
  test("$default emits DEFAULT and keeps the type", () => {
    expect(ddl(sz.string().$default(surql`"hi"`))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE string DEFAULT "hi";`,
    );
  });

  test("$default strips a leading option<> (the column is always populated)", () => {
    expect(ddl(sz.string().optional().$default(surql`"hi"`))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE string DEFAULT "hi";`,
    );
  });

  test("$default accepts a plain value, rendered as a clean literal", () => {
    expect(ddl(sz.string().$default("light"))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE string DEFAULT "light";`,
    );
    expect(ddl(sz.int().$default(0))).toBe("DEFINE FIELD x ON TABLE t TYPE int DEFAULT 0;");
    expect(ddl(sz.boolean().$default(true))).toBe("DEFINE FIELD x ON TABLE t TYPE bool DEFAULT true;");
    expect(ddl(sz.string().$defaultAlways("hi"))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE string DEFAULT ALWAYS "hi";`,
    );
  });

  test("$defaultAlways -> DEFAULT ALWAYS", () => {
    expect(ddl(sz.int().$defaultAlways(surql`0`))).toBe(
      "DEFINE FIELD x ON TABLE t TYPE int DEFAULT ALWAYS 0;",
    );
  });

  test("$value -> VALUE and strips option<>", () => {
    expect(ddl(sz.string().optional().$value(surql`string::lowercase($value)`))).toBe(
      "DEFINE FIELD x ON TABLE t TYPE string VALUE string::lowercase($value);",
    );
  });

  test("$value with { optional: true } emits VALUE; type not wrapped in option<>", () => {
    expect(ddl(sz.datetime().$value(surql`time::now()`, { optional: true }))).toBe(
      "DEFINE FIELD x ON TABLE t TYPE datetime VALUE time::now();",
    );
  });

  test("$assert -> ASSERT", () => {
    expect(ddl(sz.int().$assert(surql`$value >= 0`))).toBe(
      "DEFINE FIELD x ON TABLE t TYPE int ASSERT $value >= 0;",
    );
  });

  test("$readonly -> READONLY, $comment -> COMMENT", () => {
    expect(ddl(sz.int().$readonly())).toBe("DEFINE FIELD x ON TABLE t TYPE int READONLY;");
    expect(ddl(sz.string().$comment("a note"))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE string COMMENT "a note";`,
    );
  });

  test("$internal -> PERMISSIONS NONE (field still emitted)", () => {
    expect(ddl(sz.string().$internal())).toBe(
      "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS NONE;",
    );
  });

  test("clauses combine in a stable order", () => {
    expect(ddl(sz.int().$default(surql`0`).$readonly().$comment("n"))).toBe(
      `DEFINE FIELD x ON TABLE t TYPE int DEFAULT 0 READONLY COMMENT "n";`,
    );
  });
});

describe("nested structures expand into sub-fields", () => {
  test("object -> path.key children", () => {
    const lines = ddl(sz.object({ a: sz.string(), b: sz.int() })).split("\n");
    expect(lines).toEqual([
      "DEFINE FIELD x ON TABLE t TYPE object;",
      "DEFINE FIELD x.a ON TABLE t TYPE string;",
      "DEFINE FIELD x.b ON TABLE t TYPE int;",
    ]);
  });

  test("nested object keeps child $default metadata", () => {
    const out = ddl(sz.object({ theme: sz.string().$default(surql`"light"`) }));
    expect(out).toContain(`DEFINE FIELD x.theme ON TABLE t TYPE string DEFAULT "light";`);
  });

  test("array of objects -> path.* element field", () => {
    const lines = ddl(sz.array(sz.object({ a: sz.string() }))).split("\n");
    expect(lines).toEqual([
      "DEFINE FIELD x ON TABLE t TYPE array<object>;",
      "DEFINE FIELD x.* ON TABLE t TYPE object;",
      "DEFINE FIELD x.*.a ON TABLE t TYPE string;",
    ]);
  });

  test("array of scalars has no element sub-field", () => {
    expect(ddl(sz.string().array())).toBe("DEFINE FIELD x ON TABLE t TYPE array<string>;");
  });

  test("record / map -> object with a .* value field", () => {
    expect(ddl(sz.record(z.string(), sz.int())).split("\n")).toEqual([
      "DEFINE FIELD x ON TABLE t TYPE object;",
      "DEFINE FIELD x.* ON TABLE t TYPE int;",
    ]);
    expect(ddl(sz.map(z.string(), sz.string())).split("\n")).toEqual([
      "DEFINE FIELD x ON TABLE t TYPE object;",
      "DEFINE FIELD x.* ON TABLE t TYPE string;",
    ]);
  });

  test("loose object -> FLEXIBLE", () => {
    const out = ddl(new SField(z.looseObject({ a: z.string() })));
    expect(out).toContain("DEFINE FIELD x ON TABLE t TYPE object FLEXIBLE;");
  });

  test("intersection of objects merges children", () => {
    const out = ddl(sz.intersection(sz.object({ a: sz.string() }), sz.object({ b: sz.int() })));
    expect(out).toContain("DEFINE FIELD x ON TABLE t TYPE object;");
    expect(out).toContain("DEFINE FIELD x.a ON TABLE t TYPE string;");
    expect(out).toContain("DEFINE FIELD x.b ON TABLE t TYPE int;");
  });
});

describe("composite leaf types", () => {
  test("union", () => {
    expect(typeOf(sz.union([sz.string(), sz.int()]))).toBe("string | int");
  });

  test("enum / literal", () => {
    expect(typeOf(sz.enum(["admin", "member"]))).toBe(`"admin" | "member"`);
    expect(typeOf(sz.literal("x"))).toBe(`"x"`);
    expect(typeOf(sz.literal(42))).toBe("42");
    expect(typeOf(sz.literal(true))).toBe("true");
  });

  test("tuple", () => {
    expect(typeOf(sz.tuple([sz.string(), sz.int()]))).toBe("[string, int]");
  });

  test("nativeEnum (string and numeric)", () => {
    expect(typeOf(sz.nativeEnum({ A: "a", B: "b" }))).toBe(`"a" | "b"`);
    enum Role {
      Guest = 0,
      Admin = 1,
    }
    expect(typeOf(sz.nativeEnum(Role))).toBe("0 | 1");
  });
});

describe("edge branches", () => {
  test("a raw z.date() (no codec) -> datetime", () => {
    expect(typeOf(new SField(z.date()))).toBe("datetime");
  });

  test("an unregistered codec falls back to its wire (encoded) side", () => {
    const codec = z.codec(z.string(), z.number(), { decode: Number, encode: String });
    expect(typeOf(new SField(codec))).toBe("string");
  });

  test("intersection of non-objects -> any", () => {
    expect(typeOf(sz.intersection(sz.string(), sz.int()))).toBe("any");
  });

  test("variadic tuple -> generic array", () => {
    expect(typeOf(new SField(z.tuple([z.string()], z.number())))).toBe("array");
  });

  test("a $default with bindings is inlined into the DDL", () => {
    expect(ddl(sz.int().$default(surql`${42}`))).toBe(
      "DEFINE FIELD x ON TABLE t TYPE int DEFAULT 42;",
    );
  });
});

describe("recursive types", () => {
  test("self-referential lazy terminates at `any`", () => {
    const node: SField = sz.object({ name: sz.string(), next: sz.lazy(() => node) });
    const out = ddl(node);
    expect(out).toContain("DEFINE FIELD x.next ON TABLE t TYPE object;");
    expect(out).toContain("DEFINE FIELD x.next.next ON TABLE t TYPE any;");
  });
});

describe("defineTable", () => {
  const User = table("user", {
    id: z.string(),
    name: sz.string(),
    role: sz.enum(["admin", "member"]).$default(surql`"member"`),
    createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
    settings: sz.object({ theme: sz.string().$default(surql`"light"`) }),
  }).comment("Users");

  test("table head: NORMAL, SCHEMAFULL, COMMENT", () => {
    const head = defineTable(User).split("\n")[0];
    expect(head).toBe(`DEFINE TABLE user TYPE NORMAL SCHEMAFULL COMMENT "Users";`);
  });

  test("the implicit id field is not emitted", () => {
    expect(defineTable(User)).not.toContain("DEFINE FIELD id ");
  });

  test("fields are emitted with their metadata and nested children", () => {
    const out = defineTable(User);
    expect(out).toContain("DEFINE FIELD name ON TABLE user TYPE string;");
    expect(out).toContain(`DEFINE FIELD role ON TABLE user TYPE "admin" | "member" DEFAULT "member";`);
    expect(out).toContain(
      "DEFINE FIELD createdAt ON TABLE user TYPE datetime DEFAULT time::now() READONLY;",
    );
    expect(out).toContain(`DEFINE FIELD settings.theme ON TABLE user TYPE string DEFAULT "light";`);
  });

  test("an $internal() field is still emitted, with PERMISSIONS NONE", () => {
    const Account = table("user", { email: sz.email(), passhash: sz.string().$internal() });
    const out = defineTable(Account);
    expect(out).toContain("DEFINE FIELD passhash ON TABLE user TYPE string PERMISSIONS NONE;");
    expect(out).toContain("DEFINE FIELD email ON TABLE user TYPE string;");
  });

  test("schemaless / drop config", () => {
    expect(defineTable(User.schemaless())).toContain("SCHEMALESS");
    expect(defineTable(User.drop())).toContain("DROP");
  });

  test("existsPrefix: overwrite / ignore", () => {
    expect(defineTable(User, { exists: "overwrite" })).toContain("DEFINE TABLE OVERWRITE user");
    expect(defineTable(User, { exists: "ignore" })).toContain("DEFINE TABLE IF NOT EXISTS user");
    // applies to fields too
    expect(defineField("x", "t", sz.string(), { exists: "overwrite" })).toBe(
      "DEFINE FIELD OVERWRITE x ON TABLE t TYPE string;",
    );
  });

  describe("relations", () => {
    const A = table("user", { id: z.string() });
    const B = table("post", { id: z.string() });
    const Tag = table("tag", { id: z.string() });
    const Liked = relation("liked", { strength: sz.number().$assert(surql`$value >= 0`) })
      .from(A)
      .to(B);

    test("RELATION head with FROM/TO and skips in/out fields", () => {
      const out = defineTable(Liked);
      expect(out.split("\n")[0]).toBe("DEFINE TABLE liked TYPE RELATION FROM user TO post SCHEMAFULL;");
      expect(out).not.toContain("DEFINE FIELD in ");
      expect(out).not.toContain("DEFINE FIELD out ");
      expect(out).toContain("DEFINE FIELD strength ON TABLE liked TYPE number ASSERT $value >= 0;");
    });

    test("multi-endpoint relation -> FROM a | b", () => {
      const Multi = relation("rel").from([A, Tag]).to(B);
      expect(defineTable(Multi as TableDef<string, Shape>).split("\n")[0]).toBe(
        "DEFINE TABLE rel TYPE RELATION FROM user | tag TO post SCHEMAFULL;",
      );
    });
  });
});

describe("PERMISSIONS", () => {
  /** The first line (table head) of a table's DDL. */
  const head = (t: TableDef<string, Shape>) => defineTable(t).split("\n")[0];
  const tbl = (perms: Parameters<TableDef<string, Shape>["permissions"]>[0]) =>
    table("t", { name: sz.string() }).permissions(perms);

  describe("renderPermissions algorithm (4 table ops)", () => {
    const ops = ["select", "create", "update", "delete"] as const;

    test("true -> FULL, false -> NONE", () => {
      expect(renderPermissions(true, ops)).toBe("PERMISSIONS FULL");
      expect(renderPermissions(false, ops)).toBe("PERMISSIONS NONE");
    });

    test("a BoundQuery is shared by all ops", () => {
      expect(renderPermissions(surql`owner = $auth.id`, ops)).toBe(
        "PERMISSIONS FOR select, create, update, delete WHERE owner = $auth.id",
      );
    });

    test("object with per-op rules emits one clause per op", () => {
      expect(
        renderPermissions(
          {
            select: surql`$auth.id != NONE`,
            create: false,
            update: surql`id = $auth.id`,
            delete: surql`id = $auth.id`,
          },
          ops,
        ),
      ).toBe(
        "PERMISSIONS FOR select WHERE $auth.id != NONE FOR create NONE FOR update, delete WHERE id = $auth.id",
      );
    });

    test("`same as X` reuses X's resolved rule and merges with it", () => {
      expect(renderPermissions({ select: surql`A`, update: "same as select" }, ops)).toBe(
        "PERMISSIONS FOR select, update WHERE A",
      );
    });

    test("two identical BoundQuery exprs auto-merge into one FOR clause", () => {
      expect(
        renderPermissions({ select: surql`owner = $auth.id`, create: surql`owner = $auth.id` }, ops),
      ).toBe("PERMISSIONS FOR select, create WHERE owner = $auth.id");
    });

    test("omitted ops emit nothing; an empty object emits no clause at all", () => {
      expect(renderPermissions({ select: surql`A` }, ops)).toBe("PERMISSIONS FOR select WHERE A");
      expect(renderPermissions({}, ops)).toBe("");
    });

    test('`same as <absent op>` is a clear runtime error', () => {
      expect(() => renderPermissions({ select: "same as delete" }, ops)).toThrow(
        /references op "delete", which is not in the spec/,
      );
    });

    test("a `same as` reference cycle is a clear runtime error", () => {
      expect(() =>
        renderPermissions({ select: "same as update", update: "same as select" }, ops),
      ).toThrow(/reference cycle/);
    });
  });

  describe("table wiring (folded into the single DEFINE TABLE head)", () => {
    test(".permissions(true) -> PERMISSIONS FULL on the head", () => {
      expect(head(tbl(true))).toBe("DEFINE TABLE t TYPE NORMAL SCHEMAFULL PERMISSIONS FULL;");
    });

    test(".permissions(false) -> PERMISSIONS NONE", () => {
      expect(head(tbl(false))).toBe("DEFINE TABLE t TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;");
    });

    test("a shared BoundQuery covers all four ops, after COMMENT", () => {
      const T = table("t", { name: sz.string() })
        .comment("notes")
        .permissions(surql`owner = $auth.id`);
      expect(head(T)).toBe(
        `DEFINE TABLE t TYPE NORMAL SCHEMAFULL COMMENT "notes" PERMISSIONS FOR select, create, update, delete WHERE owner = $auth.id;`,
      );
    });

    test("per-op object with `same as` merge", () => {
      const T = tbl({
        select: surql`$auth.id != NONE`,
        create: false,
        update: surql`id = $auth.id`,
        delete: "same as update",
      });
      expect(head(T)).toBe(
        "DEFINE TABLE t TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select WHERE $auth.id != NONE FOR create NONE FOR update, delete WHERE id = $auth.id;",
      );
    });
  });

  describe("field wiring (3 ops, no delete)", () => {
    test("blanket BoundQuery covers select, create, update only", () => {
      expect(ddl(sz.string().$permissions(surql`published = true`))).toBe(
        "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS FOR select, create, update WHERE published = true;",
      );
    });

    test("an omitted field op stays unemitted (defaults to FULL in the DB)", () => {
      expect(ddl(sz.string().$permissions({ select: surql`published = true`, update: false }))).toBe(
        "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS FOR select WHERE published = true FOR update NONE;",
      );
    });

    test("$permissions(false) / (true) -> NONE / FULL", () => {
      expect(ddl(sz.string().$permissions(false))).toBe(
        "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS NONE;",
      );
      expect(ddl(sz.string().$permissions(true))).toBe(
        "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS FULL;",
      );
    });

    test("an $internal() field still emits PERMISSIONS NONE (internal wins over $permissions)", () => {
      expect(ddl(sz.string().$internal().$permissions({ select: surql`x` }))).toBe(
        "DEFINE FIELD x ON TABLE t TYPE string PERMISSIONS NONE;",
      );
    });
  });
});
