/**
 * Docs navigation model (IA owned here; content authored as MDX by the writer).
 * Drives the top nav, the left sidebar tree, breadcrumb, prev/next and active
 * state. Slugs map 1:1 to src/content/docs/<slug>.mdx and render at /docs/<slug>.
 */
export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

const d = (slug: string): string => `/docs/${slug}`;

export const sidebarNav: NavGroup[] = [
  {
    label: "Start here",
    items: [
      { label: "Introduction", href: d("introduction") },
      { label: "Quickstart", href: d("quickstart") },
    ],
  },
  {
    label: "Concepts",
    items: [
      { label: "Encoded and decoded sides", href: d("concepts/app-and-wire") },
      { label: "Codecs", href: d("concepts/codecs") },
      { label: "From schema to DDL", href: d("concepts/schema-to-ddl") },
      { label: "The migration model", href: d("concepts/migrations-model") },
    ],
  },
  {
    label: "Guides",
    items: [
      { label: "Define a table", href: d("guides/define-a-table") },
      { label: "Constraints, defaults & permissions", href: d("guides/constraints-defaults-permissions") },
      { label: "Model relationships", href: d("guides/relationships") },
      { label: "Indexes, events & functions", href: d("guides/indexes-events-functions") },
      { label: "Encode & decode rows", href: d("guides/encode-decode-rows") },
      { label: "Generate & run migrations", href: d("guides/migrations") },
      { label: "Sync without migrations", href: d("guides/sync-without-migrations") },
      { label: "Adopt an existing database", href: d("guides/adopt-existing-database") },
      { label: "Detect & review drift", href: d("guides/review-drift") },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "sz builders", href: d("reference/sz-builders") },
      { label: "Field methods", href: d("reference/field-methods") },
      { label: "Definers", href: d("reference/definers") },
      { label: "Type utilities", href: d("reference/type-utilities") },
      { label: "CLI commands", href: d("reference/cli") },
      { label: "Configuration", href: d("reference/configuration") },
      { label: "Type mapping", href: d("reference/type-mapping") },
    ],
  },
  {
    label: "Resources",
    items: [{ label: "Changelog", href: d("resources/changelog") }],
  },
];

export const topNav: NavItem[] = [
  { label: "Docs", href: d("introduction") },
  { label: "Guides", href: d("guides/define-a-table") },
  { label: "Reference", href: d("reference/sz-builders") },
  { label: "Blog", href: "/blog" },
];

export interface TocItem {
  id: string;
  text: string;
}

// Flattened, ordered list (sidebar order) for prev/next + lookups.
const flat: { group: string; item: NavItem }[] = sidebarNav.flatMap((g) =>
  g.items.map((item) => ({ group: g.label, item })),
);

/** The top-nav label to highlight for a given page href. */
export function topActiveFor(href: string): string {
  const entry = flat.find((f) => f.item.href === href);
  if (!entry) return "Docs";
  if (entry.group === "Guides") return "Guides";
  if (entry.group === "Reference") return "Reference";
  return "Docs";
}

/** Breadcrumb string "Group  /  Title" for a given page href. */
export function crumbFor(href: string): string {
  const entry = flat.find((f) => f.item.href === href);
  return entry ? `${entry.group}  /  ${entry.item.label}` : "Docs";
}

/** Previous/next pages in sidebar order. */
export function prevNextFor(href: string): { prev?: NavItem; next?: NavItem } {
  const i = flat.findIndex((f) => f.item.href === href);
  if (i === -1) return {};
  return {
    prev: i > 0 ? flat[i - 1].item : undefined,
    next: i < flat.length - 1 ? flat[i + 1].item : undefined,
  };
}
