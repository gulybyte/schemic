// The GENERIC migration spine over a {@link KindRegistry} — core's kind-blind orchestration. It loops
// the registered kinds, lowers both schema sides to portable objects, classifies each object as
// add/change/remove, ORDERS them across kinds by a dependency graph, and emits up/down DDL. It never
// names a kind: every kind-specific decision is delegated to that kind's {@link KindEngine}.
//
// Cross-kind ordering is the load-bearing part (docs/kind-registry.md §7.1). THREE layers:
//   1. dependency GRAPH + topological sort  -> CORRECTNESS (an object emits after everything it deps on)
//   2. kind ORDINAL (registration order)     -> stable TIE-BREAK among independent objects (layering)
//   3. OWNER clustering                       -> READABILITY (an index right after its table)
// A per-kind ordinal ALONE is wrong: a table's event can call a function, so the function must emit
// BEFORE the table — a function-before-table the graph handles and an ordinal cannot. Drops reverse it.

import type { Definable, KindRegistry, PortableObject, Ref } from "./registry";

const refKey = (r: Ref) => `${r.kind}:${r.name}`;

/** A node in the dependency graph: identity + the edges/owner used to order it. */
export interface OrderNode {
  readonly kind: string;
  readonly name: string;
  /** Objects this node must come AFTER (only intra-set refs constrain; external refs are ignored). */
  readonly deps: Ref[];
  /** Owning object to cluster next to (readability tie-break only; never overrides `deps`). */
  readonly owner?: Ref;
}

/**
 * Kahn's topological sort with two presentation tweaks among the nodes whose deps are all satisfied:
 * prefer one OWNED by the currently-open cluster (so a table's children follow it), then lowest
 * (kind-ordinal, then name). Correctness (deps) always wins — an owned/low-ordinal node can't jump a
 * dependency. A genuine cycle throws (a named error). Refs to nodes outside `nodes` are ignored (an
 * object may depend on something untouched by this diff — it already exists / isn't changing).
 */
export function orderObjects<T extends OrderNode>(
  nodes: T[],
  ordinalOf: (kind: string) => number,
): T[] {
  const byKey = new Map(nodes.map((n) => [refKey(n), n]));
  const indeg = new Map<string, number>(nodes.map((n) => [refKey(n), 0]));
  const dependents = new Map<string, string[]>();
  for (const n of nodes)
    for (const d of n.deps) {
      if (!byKey.has(refKey(d))) continue; // external dep -> not a constraint within this set
      indeg.set(refKey(n), (indeg.get(refKey(n)) ?? 0) + 1);
      const list = dependents.get(refKey(d)) ?? [];
      list.push(refKey(n));
      dependents.set(refKey(d), list);
    }

  const out: T[] = [];
  const done = new Set<string>();
  let group: string | undefined; // the last unowned node emitted == the open cluster
  while (out.length < nodes.length) {
    const ready = nodes.filter(
      (n) => !done.has(refKey(n)) && indeg.get(refKey(n)) === 0,
    );
    if (ready.length === 0)
      throw new Error(
        `dependency cycle among: ${nodes
          .filter((n) => !done.has(refKey(n)))
          .map(refKey)
          .join(", ")}`,
      );
    ready.sort((a, b) => {
      const ao = a.owner && refKey(a.owner) === group ? 0 : 1; // prefer the open cluster
      const bo = b.owner && refKey(b.owner) === group ? 0 : 1;
      return (
        ao - bo ||
        ordinalOf(a.kind) - ordinalOf(b.kind) ||
        refKey(a).localeCompare(refKey(b))
      );
    });
    const next = ready[0];
    out.push(next);
    done.add(refKey(next));
    if (!next.owner) group = refKey(next); // a top-level object opens a new cluster
    for (const dep of dependents.get(refKey(next)) ?? [])
      indeg.set(dep, (indeg.get(dep) ?? 1) - 1);
  }
  return out;
}

/** One classified object change, carrying its ordering metadata + the portable sides for DDL. */
interface Change extends OrderNode {
  readonly op: "add" | "change" | "remove";
  readonly prev?: PortableObject;
  readonly next?: PortableObject;
}

/** An up/down DDL program (each a list of statements). */
export interface KindPlan {
  up: string[];
  down: string[];
}

/**
 * Diff two authored schema states into an executable up/down program, generically over the registry.
 *
 * For each registered kind: lower both sides, match portable objects by name, and classify —
 * add (next only) / remove (prev only) / change (both, but their emitted DDL differs). Then order all
 * non-removes parent-first (the dependency graph) and removes child-first (reverse), and walk that one
 * sequence building `up` and its inverse; `down` is the inverse run backwards (a rolled-back parent is
 * recreated before its children, an added object dropped child-first). Same shape as the fixed-slot
 * `planPortable`, but assembled ACROSS kinds via the graph rather than relying on emit-rank.
 */
export function planKinds(
  registry: KindRegistry,
  prev: Definable[],
  next: Definable[],
): KindPlan {
  // Lower each side, per kind, to portable objects keyed by `kind:name`.
  const lower = (defs: Definable[]) => {
    const byKey = new Map<string, PortableObject>();
    for (const d of defs) {
      const engine = registry.engine(d.kind);
      if (!engine) continue; // a definable of an unregistered kind isn't ours to plan
      const p = engine.lower(d);
      byKey.set(refKey(p), p);
    }
    return byKey;
  };
  const prevByKey = lower(prev);
  const nextByKey = lower(next);

  // Classify every touched object.
  const changes: Change[] = [];
  const allKeys = new Set([...prevByKey.keys(), ...nextByKey.keys()]);
  for (const k of allKeys) {
    const p = prevByKey.get(k);
    const n = nextByKey.get(k);
    const portable = n ?? p;
    if (!portable) continue;
    const engine = registry.engine(portable.kind);
    if (!engine) continue;
    const node = {
      kind: portable.kind,
      name: portable.name,
      deps: engine.deps?.(portable) ?? [],
      owner: engine.owner?.(portable),
    };
    if (p && !n) changes.push({ op: "remove", prev: p, ...node });
    else if (!p && n) changes.push({ op: "add", next: n, ...node });
    else if (p && n) {
      const same = engine.emit(p).join("\n") === engine.emit(n).join("\n");
      if (!same) changes.push({ op: "change", prev: p, next: n, ...node });
    }
  }

  // Order each class parent-first (the dependency graph). `up` runs creates/changes parent-first then
  // drops child-first; `down` is the mirror: recreate drops parent-first, then undo creates/changes
  // child-first. We invert PER OBJECT (not by reversing the flat DDL list) so a kind's multi-line
  // block — a table emitted with its fields — keeps its internal order in both directions.
  const ord = (kind: string) => registry.ordinal(kind);
  const nonRemoves = orderObjects(
    changes.filter((c) => c.op !== "remove"),
    ord,
  );
  const removes = orderObjects(
    changes.filter((c) => c.op === "remove"),
    ord,
  );

  const engineOf = (c: Change) => registry.engine(c.kind);
  const overwriteUp = (c: Change, a: PortableObject, b: PortableObject) => {
    const e = engineOf(c);
    if (!e) return [];
    return e.overwrite?.(a, b) ?? [...e.remove(a), ...e.emit(b)];
  };

  const up: string[] = [];
  for (const c of nonRemoves) {
    const e = engineOf(c);
    if (!e) continue;
    if (c.op === "add" && c.next) up.push(...e.emit(c.next));
    else if (c.op === "change" && c.prev && c.next)
      up.push(...overwriteUp(c, c.prev, c.next));
  }
  for (const c of [...removes].reverse()) {
    // drops child-first
    const e = engineOf(c);
    if (e && c.prev) up.push(...e.remove(c.prev));
  }

  const down: string[] = [];
  for (const c of removes) {
    // recreate dropped objects parent-first
    const e = engineOf(c);
    if (e && c.prev) down.push(...e.emit(c.prev));
  }
  for (const c of [...nonRemoves].reverse()) {
    // undo creates/changes child-first
    const e = engineOf(c);
    if (!e) continue;
    if (c.op === "add" && c.next) down.push(...e.remove(c.next));
    else if (c.op === "change" && c.prev && c.next)
      down.push(...overwriteUp(c, c.next, c.prev));
  }
  return { up, down };
}

/**
 * Fresh-apply DDL for an authored schema: every object created, ordered across kinds by the graph.
 * (The `up` of a diff from an empty state — convenient for `emit`/scaffold paths.)
 */
export function emitKinds(registry: KindRegistry, defs: Definable[]): string[] {
  return planKinds(registry, [], defs).up;
}

/**
 * Reverse direction, fanned out across kinds: introspect every introspectable kind off one live
 * connection and flatten into portable objects. The RESOLUTION of "per-kind vs one driver read":
 * the contract is per-kind ({@link KindEngine.introspect}), but a driver backs all of its kinds with
 * ONE shared (memoized) read of `conn` and slices out each kind's objects — so the fan-out here costs
 * a single round-trip, not N. A kind without `introspect` contributes nothing (not introspectable).
 */
export async function introspectKinds(
  registry: KindRegistry,
  conn: unknown,
): Promise<PortableObject[]> {
  const out: PortableObject[] = [];
  for (const [, engine] of registry.entries()) {
    if (!engine.introspect) continue;
    out.push(...(await engine.introspect(conn)));
  }
  return out;
}
