import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { DateTime, RecordId, surql } from "surrealdb";
import { relation, RecordIdField, sz, table } from "../../src/pure";

const defType = (s: z.ZodType) => (s._zod.def as { type: string }).type;

describe("smart id", () => {
  test("a plain id schema becomes record<self, idType>", () => {
    const T = table("widget", { id: z.string(), name: sz.string() });
    const id = T.fields.id as RecordIdField<"widget">;
    expect(id).toBeInstanceOf(RecordIdField);
    expect(id.tables).toEqual(["widget"]);
    expect(id.schema.safeParse(new RecordId("widget", "x")).success).toBe(true);
    expect(id.schema.safeParse(new RecordId("other", "x")).success).toBe(false);
  });

  test("an omitted id defaults to record<self>", () => {
    const T = table("widget", { name: sz.string() });
    const id = T.fields.id as RecordIdField<"widget">;
    expect(id).toBeInstanceOf(RecordIdField);
    expect(id.tables).toEqual(["widget"]);
  });
});

describe("make / makePartial", () => {
  const User = table("user", {
    id: z.string(),
    name: sz.string(),
    role: sz.enum(["admin", "member"]).$default(surql`"member"`),
    settings: sz.object({ theme: sz.string(), lastSeen: sz.datetime().optional() }),
    createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
  });

  test("make omits absent fields and encodes the present ones", () => {
    const payload = User.make({
      name: "Alice",
      settings: { theme: "dark", lastSeen: new Date("2022-01-01T00:00:00.000Z") },
    });
    expect(Object.keys(payload).sort()).toEqual(["name", "settings"]);
    expect(payload.name).toBe("Alice");
    // nested datetime encoded to DateTime
    expect((payload.settings as { lastSeen: unknown }).lastSeen).toBeInstanceOf(DateTime);
  });

  test("makePartial encodes only the given keys", () => {
    const patch = User.makePartial({ role: "admin" });
    expect(Object.keys(patch)).toEqual(["role"]);
    expect(patch.role).toBe("admin");
  });
});

describe("$internal fields (runtime)", () => {
  const Account = table("account", {
    id: z.string(),
    email: sz.email(),
    passhash: sz.string().$internal(),
  });

  test("decode strips the internal field; the system view keeps it", () => {
    const row = { id: new RecordId("account", "1"), email: "alice@example.com", passhash: "secret" };
    const app = Account.decode(row);
    expect(app).not.toHaveProperty("passhash");
    expect(app.email).toBe("alice@example.com");

    const sys = Account.system.decode(row);
    expect(sys.passhash).toBe("secret");
    expect(sys.email).toBe("alice@example.com");
  });

  test("make omits internal; system.make includes it", () => {
    const payload = Account.make({ email: "alice@example.com" });
    expect(payload).not.toHaveProperty("passhash");
    expect(payload.email).toBe("alice@example.com");

    const sysPayload = Account.system.make({ email: "alice@example.com", passhash: "secret" });
    expect(sysPayload.passhash).toBe("secret");
  });
});

describe("shape ops", () => {
  const User = table("user", {
    id: z.string(),
    name: sz.string(),
    email: sz.email(),
    bio: sz.string().optional(),
  });

  test("pick / omit", () => {
    expect(Object.keys(User.pick("name", "email").fields).sort()).toEqual(["email", "name"]);
    expect(Object.keys(User.omit("email").fields).sort()).toEqual(["bio", "id", "name"]);
  });

  test("partial makes every field optional", () => {
    const p = User.partial();
    for (const f of Object.values(p.fields)) expect(defType(f.schema)).toBe("optional");
  });

  test("required unwraps optional fields", () => {
    const r = User.required();
    expect(defType(r.fields.bio.schema)).toBe("string");
  });

  test("extend adds fields and preserves config", () => {
    const e = User.comment("note").extend({ nick: sz.string() });
    expect(Object.keys(e.fields)).toContain("nick");
    expect(e.config.comment).toBe("note");
  });
});

describe("config chain (immutable)", () => {
  const User = table("user", { id: z.string() });

  test("schemaless / schemafull / drop / comment return new defs", () => {
    expect(User.schemaless().config.schemafull).toBe(false);
    expect(User.schemaless().schemafull().config.schemafull).toBe(true);
    expect(User.drop().config.drop).toBe(true);
    expect(User.comment("x").config.comment).toBe("x");
    // original untouched
    expect(User.config.schemafull).toBe(true);
    expect(User.config.drop).toBeUndefined();
  });
});

describe("relation builder", () => {
  const User = table("user", { id: z.string() });
  const Post = table("post", { id: z.string() });
  const Tag = table("tag", { id: z.string() });

  test("from().to() sets endpoints, in/out fields, and relation config", () => {
    const Liked = relation("liked", { strength: sz.number() }).from(User).to(Post);
    expect(Liked.kind).toBe("relation");
    expect(Liked.config.relation).toEqual({ from: ["user"], to: ["post"] });
    expect(Liked.fields.in).toBeInstanceOf(RecordIdField);
    expect(Liked.fields.out).toBeInstanceOf(RecordIdField);
    expect((Liked.fields.in as RecordIdField<"user">).tables).toEqual(["user"]);
    expect((Liked.fields.out as RecordIdField<"post">).tables).toEqual(["post"]);
  });

  test("multi-endpoint relation collects all table names", () => {
    const Rel = relation("rel").from([User, Tag]).to(Post);
    expect(Rel.config.relation).toEqual({ from: ["user", "tag"], to: ["post"] });
  });

  test("a normal table has no relation config", () => {
    expect(User.kind).toBe("table");
    expect(User.config.relation).toBeUndefined();
  });
});
