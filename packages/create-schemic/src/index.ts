import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
// The @schemic versions this scaffolder pins are its OWN version (the packages release lockstep), so a
// fresh project always gets a matching set. Inlined at build by tsup.
import { version as SCHEMIC_VERSION } from "../package.json";

const RANGE = `^${SCHEMIC_VERSION}`;

/** Supported drivers: the package + the runtime deps a project authoring/connecting with it needs. */
const DRIVERS: Record<
  string,
  { label: string; pkg: string; deps: Record<string, string> }
> = {
  surrealdb: {
    label: "SurrealDB",
    pkg: "@schemic/surrealdb",
    deps: { surrealdb: "^2.0.3", zod: "^4.3.5" },
  },
  postgres: {
    label: "PostgreSQL (PGlite)",
    pkg: "@schemic/postgres",
    deps: { "@electric-sql/pglite": "^0.5.2", zod: "^4.3.5" },
  },
};
const DRIVER_NAMES = Object.keys(DRIVERS);
const PMS = ["bun", "npm", "pnpm", "yarn"] as const;
type Pm = (typeof PMS)[number];

const style = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};

interface Options {
  dir?: string;
  driver?: string;
  pm?: string;
  install?: boolean; // undefined = ask
  git: boolean;
  yes: boolean;
}

function parseArgs(argv: string[]): Options {
  const o: Options = { git: true, yes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-y" || a === "--yes") o.yes = true;
    else if (a === "--no-install") o.install = false;
    else if (a === "--no-git") o.git = false;
    else if (a === "--driver") o.driver = argv[++i];
    else if (a === "--pm") o.pm = argv[++i];
    else if (a === "-h" || a === "--help") {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith("-") && o.dir === undefined) o.dir = a;
  }
  return o;
}

function printHelp(): void {
  console.log(`create-schemic — scaffold a new Schemic project

Usage: create-schemic [directory] [options]

Options:
  --driver <name>   ${DRIVER_NAMES.join(" | ")}
  --pm <name>       ${PMS.join(" | ")} (the package manager to install with)
  --no-install      scaffold only; don't install or run \`schemic init\`
  --no-git          don't run \`git init\`
  -y, --yes         accept defaults, no prompts
  -h, --help        show this help`);
}

/** Which package manager invoked us (from npm_config_user_agent), for a sensible default. */
function detectPm(): Pm {
  const ua = process.env.npm_config_user_agent ?? "";
  for (const pm of PMS) if (ua.startsWith(pm)) return pm;
  return "npm";
}

function rl() {
  return createInterface({ input: process.stdin, output: process.stdout });
}
async function ask(question: string, fallback: string): Promise<string> {
  if (!process.stdin.isTTY) return fallback;
  const i = rl();
  try {
    const a = (
      await i.question(`${question} ${style.dim(`(${fallback})`)} `)
    ).trim();
    return a || fallback;
  } finally {
    i.close();
  }
}
async function confirm(question: string, fallback: boolean): Promise<boolean> {
  if (!process.stdin.isTTY) return fallback;
  const i = rl();
  try {
    const a = (
      await i.question(
        `${question} ${style.dim(fallback ? "(Y/n)" : "(y/N)")} `,
      )
    )
      .trim()
      .toLowerCase();
    return a ? a === "y" || a === "yes" : fallback;
  } finally {
    i.close();
  }
}
async function select(
  question: string,
  choices: string[],
  fallback: string,
): Promise<string> {
  if (!process.stdin.isTTY) return fallback;
  console.log(style.bold(question));
  choices.forEach((c, n) =>
    console.log(
      `  ${n + 1}) ${c}${c === fallback ? style.dim(" (default)") : ""}`,
    ),
  );
  const i = rl();
  try {
    const a = (await i.question(style.dim("> "))).trim();
    const n = Number.parseInt(a, 10);
    if (a && n >= 1 && n <= choices.length) return choices[n - 1];
    return choices.includes(a) ? a : fallback;
  } finally {
    i.close();
  }
}

// --- templates ---------------------------------------------------------------------------------

function packageJson(name: string, driver: string, pm: Pm): string {
  const d = DRIVERS[driver];
  const deps: Record<string, string> = {
    "@schemic/cli": RANGE,
    [d.pkg]: RANGE,
    ...d.deps,
  };
  // pnpm's strict node_modules won't resolve a transitive @schemic/core, but the scaffolded config
  // imports `@schemic/core/config` — so under pnpm it must be a direct dependency.
  if (pm === "pnpm") deps["@schemic/core"] = RANGE;
  const sorted = Object.fromEntries(Object.entries(deps).sort());
  return `${JSON.stringify(
    {
      name,
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        "db:gen": "schemic gen",
        "db:diff": "schemic diff",
        "db:migrate": "schemic migrate",
        "db:status": "schemic status",
        "db:pull": "schemic pull",
        seed: "schemic seed",
      },
      dependencies: sorted,
      devDependencies: { "@types/node": "^20", typescript: "^5" },
    },
    null,
    2,
  )}\n`;
}

function tsconfig(): string {
  return `${JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "Preserve",
        moduleResolution: "bundler",
        moduleDetection: "force",
        strict: true,
        skipLibCheck: true,
        // for \`import sql from "./x.surql" with { type: "text" }\` + the scaffolded seeds.d.ts + JSON
        resolveJsonModule: true,
        noEmit: true,
        lib: ["ESNext"],
        types: ["node"],
      },
      exclude: ["node_modules"],
    },
    null,
    2,
  )}\n`;
}

const GITIGNORE = `node_modules/
.env
*.log
.DS_Store
`;

// --- write + run -------------------------------------------------------------------------------

function writeIfAbsent(dir: string, file: string, content: string): boolean {
  const path = join(dir, file);
  if (existsSync(path)) {
    console.log(style.dim(`  · ${file} (exists, skipped)`));
    return false;
  }
  writeFileSync(path, content);
  console.log(`  ${style.green("+")} ${file}`);
  return true;
}

function run(cmd: string, args: string[], cwd: string): boolean {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  return r.status === 0;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  console.log(style.bold("\ncreate-schemic\n"));

  // 1. directory / name
  let dir = opts.dir;
  if (!dir)
    dir = opts.yes
      ? "schemic-app"
      : await ask("Project directory:", "schemic-app");
  const target = resolve(process.cwd(), dir);
  const name = basename(target);
  mkdirSync(target, { recursive: true });
  if (readdirSync(target).length && !opts.yes) {
    if (
      !(await confirm(
        `Directory ${style.bold(dir)} is not empty — continue?`,
        false,
      ))
    ) {
      console.log(style.dim("Aborted."));
      process.exit(1);
    }
  }

  // 2. driver
  let driver = opts.driver;
  if (!driver)
    driver = opts.yes
      ? "surrealdb"
      : await select(
          "Which database driver?",
          DRIVER_NAMES.map((n) => n),
          "surrealdb",
        );
  if (!DRIVERS[driver]) {
    console.error(
      style.red(
        `Unknown driver "${driver}". Known: ${DRIVER_NAMES.join(", ")}.`,
      ),
    );
    process.exit(1);
  }

  // 3. install? + which package manager (ask, default = detected)
  const detected = detectPm();
  let install = opts.install;
  if (install === undefined)
    install = opts.yes
      ? true
      : await confirm("Install dependencies now?", true);
  let pm: Pm = (opts.pm as Pm) ?? detected;
  if (install && !opts.pm && !opts.yes)
    pm = (await select(
      "Install with which package manager?",
      [detected, ...PMS.filter((p) => p !== detected)],
      detected,
    )) as Pm;

  // 4. write the project envelope
  console.log(`\nScaffolding ${style.bold(name)} (${DRIVERS[driver].label})\n`);
  writeIfAbsent(target, "package.json", packageJson(name, driver, pm));
  writeIfAbsent(target, "tsconfig.json", tsconfig());
  writeIfAbsent(target, ".gitignore", GITIGNORE);

  if (opts.git && !existsSync(join(target, ".git")))
    run("git", ["init", "-q"], target);

  // 5. install + compose on `schemic init` (which scaffolds config + database/ via the driver)
  if (install) {
    console.log(style.dim(`\nInstalling with ${pm}...`));
    if (!run(pm, ["install"], target)) {
      console.error(
        style.red(
          `\n${pm} install failed — fix it, then run \`schemic init\`.`,
        ),
      );
      process.exit(1);
    }
    console.log(style.dim("\nScaffolding the schema (schemic init)...\n"));
    const runtime = pm === "bun" ? "bun" : "node";
    const cliJs = join(
      target,
      "node_modules",
      "@schemic",
      "cli",
      "lib",
      "cli.js",
    );
    run(runtime, [cliJs, "init", "--driver", driver], target);
  }

  // 6. next steps
  console.log(`\n${style.green("✓")} ${style.bold(name)} ready.\n`);
  const cd = dir === "." ? "" : `  cd ${dir}\n`;
  if (install) {
    console.log(
      `Next:\n${cd}  cp .env.example .env   ${style.dim("# set your connection")}\n  ${pm} run db:gen\n  ${pm} run db:migrate\n`,
    );
  } else {
    console.log(
      `Next:\n${cd}  ${pm} install\n  ${pm} exec schemic init --driver ${driver}\n  cp .env.example .env\n  ${pm} run db:gen\n`,
    );
  }
}

main().catch((e: unknown) => {
  console.error(style.red(`\n${e instanceof Error ? e.message : String(e)}`));
  process.exit(1);
});
