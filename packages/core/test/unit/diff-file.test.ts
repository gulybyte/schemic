import { describe, expect, test } from "bun:test";
import { buildSnapshot, diffSnapshots, formatItems } from "../../src/cli/diff";
import { EMPTY_SNAPSHOT } from "../../src/cli/meta";
import { defineTable, sz } from "../../src/pure";

describe("diff file annotations", () => {
  const User = defineTable("user", { id: sz.string(), email: sz.email() });
  const FILE = "database/schema/tables/user.ts";
  const fileOf = new Map<unknown, string>([[User, `/proj/${FILE}`]]);
  const snapshot = () => buildSnapshot([User], [], { fileOf, root: "/proj" });

  test("buildSnapshot stores the project-relative file per statement", () => {
    for (const s of Object.values(snapshot().statements))
      expect(s.file).toBe(FILE);
  });

  test("diffSnapshots carries the file onto add items", () => {
    const diff = diffSnapshots(EMPTY_SNAPSHOT, snapshot());
    expect(diff.items?.length).toBeGreaterThan(0);
    expect(diff.items?.every((it) => it.file === FILE)).toBe(true);
  });

  test("a removed object keeps the file it was in (from the snapshot)", () => {
    const diff = diffSnapshots(snapshot(), EMPTY_SNAPSHOT);
    const removed = (diff.items ?? []).filter((it) => it.op === "remove");
    expect(removed.length).toBeGreaterThan(0);
    expect(removed.every((it) => it.file === FILE)).toBe(true);
  });

  test("formatItems renders the file in the group header", () => {
    const diff = diffSnapshots(EMPTY_SNAPSHOT, snapshot());
    const out = formatItems(diff.items ?? []);
    expect(out).toContain("Table: user");
    expect(out).toContain(FILE);
  });

  test("no file is shown when the snapshot has none (old snapshots / live DB)", () => {
    const diff = diffSnapshots(EMPTY_SNAPSHOT, buildSnapshot([User]));
    expect(diff.items?.every((it) => it.file === undefined)).toBe(true);
    expect(formatItems(diff.items ?? [])).not.toContain(".ts");
  });
});
