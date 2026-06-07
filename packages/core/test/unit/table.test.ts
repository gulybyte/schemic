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

describe("nested create-optionality (runtime)", () => {
  const Widget = table("widget", {
    id: z.string(),
    settings: sz.object({
      theme: sz.string().$default(surql`"x"`),
      tz: sz.string(),
      lastSeen: sz.datetime().optional(),
    }),
  });

  test("make omits an absent nested defaulted field so the DB fills it", () => {
    const payload = Widget.make({ settings: { tz: "utc" } });
    expect(Object.keys(payload)).toEqual(["settings"]);
    const settings = payload.settings as Record<string, unknown>;
    expect(settings).not.toHaveProperty("theme");
    expect(Object.keys(settings)).toEqual(["tz"]);
    expect(settings.tz).toBe("utc");
  });

  test("make includes a provided nested field and encodes nested codecs", () => {
    const payload = Widget.make({
      settings: { tz: "utc", theme: "dark", lastSeen: new Date("2022-01-01T00:00:00.000Z") },
    });
    const settings = payload.settings as Record<string, unknown>;
    expect(Object.keys(settings).sort()).toEqual(["lastSeen", "theme", "tz"]);
    expect(settings.theme).toBe("dark");
    // nested datetime codec still encoded through the recursion
    expect(settings.lastSeen).toBeInstanceOf(DateTime);
  });

  test("makePartial encodes the full nested object (no sibling dropped)", () => {
    const patch = Widget.makePartial({ settings: { theme: "dark", tz: "utc" } });
    const settings = patch.settings as Record<string, unknown>;
    expect(Object.keys(settings).sort()).toEqual(["theme", "tz"]);
    expect(settings.theme).toBe("dark");
    expect(settings.tz).toBe("utc");
  });

  test("array<object>: absent nested defaults are omitted per element", () => {
    const List = table("list", {
      id: z.string(),
      tags: sz.object({ name: sz.string(), color: sz.string().$default("#fff") }).array(),
    });
    const payload = List.make({ tags: [{ name: "a" }, { name: "b", color: "#000" }] });
    const tags = payload.tags as Record<string, unknown>[];
    expect(tags[0]).not.toHaveProperty("color");
    expect(Object.keys(tags[0]!)).toEqual(["name"]);
    expect(tags[1]!.color).toBe("#000");
  });

  test("makePartial is deep-partial: a partial nested object round-trips (no sibling added)", () => {
    // MERGE deep-merges, so a single nested key is a valid patch — and only it is emitted.
    const patch = Widget.makePartial({ settings: { theme: "dark" } });
    expect(Object.keys(patch)).toEqual(["settings"]);
    expect(patch.settings as Record<string, unknown>).toEqual({ theme: "dark" });
  });
});

describe("make / safeMake agreement on nested input (Fix 1)", () => {
  const T = table("nested", {
    id: z.string(),
    settings: sz.object({ theme: sz.string().$default(surql`"x"`), tz: sz.string() }),
  });
  // Mirror helper: did `make` throw for this input?
  const makeThrew = (input: Parameters<typeof T.make>[0]) => {
    try {
      T.make(input);
      return false;
    } catch {
      return true;
    }
  };

  test("a nested-partial input: make accepts and safeMake agrees (same data)", () => {
    const input = { settings: { tz: "utc" } } as const;
    expect(makeThrew(input)).toBe(false);
    const res = T.safeMake(input);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data as Record<string, unknown>).toEqual({ settings: { tz: "utc" } });
  });

  test("an invalid nested field: make throws and safeMake agrees (rejects, correct path)", () => {
    // tz must be a string — both paths must reject.
    const input = { settings: { tz: 123 } } as unknown as Parameters<typeof T.make>[0];
    expect(makeThrew(input)).toBe(true);
    const res = T.safeMake(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBeInstanceOf(z.ZodError);
      expect(res.error.issues.map((i) => i.path.join("."))).toContain("settings.tz");
    }
  });
});

describe("safeMake / make validation (#6, #7)", () => {
  const User = table("user", {
    id: z.string(),
    name: sz.string().$min(1),
    email: sz.email(),
    createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
    passhash: sz.string().$internal(),
  });

  test("safeMake with valid input -> { success: true, data } with encoded/wire values", () => {
    const res = User.safeMake({
      name: "Alice",
      email: "alice@example.com",
      createdAt: new Date("2022-01-01T00:00:00.000Z"),
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("Alice");
      expect(res.data.email).toBe("alice@example.com");
      // codec field encoded to its wire value
      expect(res.data.createdAt).toBeInstanceOf(DateTime);
    }
  });

  test("safeMake with invalid input -> { success: false } with an aggregated ZodError", () => {
    const res = User.safeMake({ name: "", email: "not-an-email" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBeInstanceOf(z.ZodError);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("name"); // .$min(1) rejects ""
      expect(paths).toContain("email"); // bad email format
    }
  });

  test("make throws a ZodError on invalid input", () => {
    expect(() => User.make({ name: "", email: "alice@example.com" })).toThrow();
    expect(() => User.make({ name: "Alice", email: "nope" })).toThrow();
  });

  test("safeMakePartial validates only the provided keys", () => {
    expect(User.safeMakePartial({ name: "Bob" }).success).toBe(true);
    expect(User.safeMakePartial({ name: "" }).success).toBe(false);
  });

  test("SystemView.safeMake validates internal fields too", () => {
    const ok = User.system.safeMake({ name: "Alice", email: "a@b.co", passhash: "secret" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.passhash).toBe("secret");

    const bad = User.system.safeMake({ name: "", email: "a@b.co", passhash: "secret" });
    expect(bad.success).toBe(false);
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
