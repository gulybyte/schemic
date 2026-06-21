#!/usr/bin/env bun
/**
 * Land a green, backward-compatible PR branch onto `main` AND clean up after it — so worktrees never
 * pile up. This is core-dev's standard landing step (see CLAUDE.md "Cleanup on merge"):
 *
 *   1. fast-forward-only push of <branch> -> main (refuses if the branch has diverged; rebase first)
 *   2. remove the worktree checked out on <branch>, if any (`git worktree remove`)
 *   3. delete the branch locally and on the remote
 *
 * Usage:
 *   bun scripts/land.ts <branch> [--remote origin] [--no-push] [--keep-branch]
 *
 *   --no-push      skip the push (the branch is already on main) — just clean up the worktree+branch
 *   --keep-branch  remove the worktree but keep the branch (rare; e.g. follow-up work pending)
 */
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const branch = argv.find((a) => !a.startsWith("-"));
const flag = (name: string) => argv.includes(name);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

if (!branch) {
  console.error(
    "usage: bun scripts/land.ts <branch> [--remote origin] [--no-push] [--keep-branch]",
  );
  process.exit(1);
}

const remote = opt("--remote", "origin");
const main = `${remote}/main`;
const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();
const gitIO = (...args: string[]) =>
  execFileSync("git", args, { stdio: "inherit" });

git("fetch", remote, "-q");

// Fast-forward guard: main must be an ancestor of the branch, i.e. the branch is main + new commits
// on top. A diverged branch (someone pushed to main since) is rejected so a land never rewrites main.
let isFF = true;
try {
  execFileSync("git", ["merge-base", "--is-ancestor", main, branch], {
    stdio: "ignore",
  });
} catch {
  isFF = false;
}
if (!isFF) {
  console.error(
    `refusing to land: ${branch} is not a fast-forward of ${main} — rebase it onto ${main} first.`,
  );
  process.exit(1);
}

const ahead = git("rev-list", "--count", `${main}..${branch}`);
if (ahead === "0") {
  console.log(`${branch} is already on ${main} — nothing to push; cleaning up.`);
} else if (flag("--no-push")) {
  console.log(`--no-push: leaving ${ahead} commit(s) unpushed; cleaning up.`);
} else {
  console.log(`pushing ${branch} -> main (${ahead} commit(s))...`);
  gitIO("push", remote, `${branch}:main`);
}

// Remove the worktree (if any) checked out on this branch.
let removedWorktree = false;
for (const block of git("worktree", "list", "--porcelain").split("\n\n")) {
  const path = block.match(/^worktree (.+)$/m)?.[1];
  const onBranch = block.match(/^branch refs\/heads\/(.+)$/m)?.[1];
  if (onBranch === branch && path) {
    gitIO("worktree", "remove", "--force", path);
    console.log(`removed worktree ${path}`);
    removedWorktree = true;
  }
}
if (!removedWorktree) console.log("no worktree was checked out on this branch.");

// Delete the branch locally + on the remote (best-effort; it may not exist on either).
if (!flag("--keep-branch")) {
  try {
    execFileSync("git", ["branch", "-D", branch], { stdio: "ignore" });
    console.log(`deleted local branch ${branch}`);
  } catch {
    /* not a local branch */
  }
  try {
    execFileSync("git", ["push", remote, "--delete", branch], {
      stdio: "ignore",
    });
    console.log(`deleted remote branch ${remote}/${branch}`);
  } catch {
    /* not on the remote */
  }
}

console.log(`landed ${branch}.`);
