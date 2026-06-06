import { z } from "zod";
import { surql } from "surrealdb";
import { sz, table, relation, type App, type Wire } from "../src";

/**
 * Showcase data model for a tiny blog / social app. Demonstrates: smart record
 * ids, record links, arrays of links, chained graph relations, DB-side
 * defaults/asserts/readonly, schemafull + comment config, and derived shapes.
 */

/** Users — schemafull, with DB-managed timestamps and status. */
export const User = table("user", {
  id: z.string(), // -> record<user> with a string id
  name: sz.string(),
  email: sz.email(),
  bio: sz.string().optional().$comment("Short profile blurb"),
  settings: sz.object({
    theme: sz.string().$default(surql`"light"`),
    notifications: sz.boolean().$default(surql`true`),
    lastSeen: sz.datetime().optional(),
  }),
  status: sz.string().$default(surql`"pending"`),
  role: sz.enum(["admin", "member"]).$default(surql`"member"`),
  createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
  bestFriend: sz.recordId("user").optional(),
}).comment("Application users");

/** Tags — a simple lookup table with string ids. */
export const Tag = table("tag", {
  id: z.string(),
  label: sz.string(),
  slug: sz.string(),
});

/** Posts — id omitted (defaults to record<post>); link to one author and many tags. */
export const Post = table("post", {
  author: User.record(), // record<user>
  title: sz.string(),
  body: sz.string(),
  tags: Tag.record().array(), // array<record<tag>>
  published: sz.boolean().$default(surql`false`),
  views: sz.number().$default(surql`0`).$readonly(),
  publishedAt: sz.datetime().optional(),
  createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
}).comment("Blog posts");

/** Comments — link a post and its author. */
export const Comment = table("comment", {
  post: Post.record(),
  author: User.record(),
  body: sz.string(),
  createdAt: sz.datetime().$default(surql`time::now()`),
});

/** Graph relation: user ->friend-> user. */
export const Friend = relation("friend", {
  since: sz.datetime().$default(surql`time::now()`),
  strength: sz.number().$assert(surql`$value >= 0 AND $value <= 1`),
})
  .from(User)
  .to(User);

/** Graph relation: user ->liked-> post. */
export const Liked = relation("liked", {
  at: sz.datetime().$default(surql`time::now()`),
})
  .from(User)
  .to(Post);

/** Derived shapes — same field metadata, different field sets. */
export const PublicUser = User.omit("email", "status"); // safe to expose
export const UserPatch = User.omit("id", "createdAt").partial(); // PATCH body

// Inferred types
export type User = App<typeof User>;
export type UserRow = Wire<typeof User>;
export type Post = App<typeof Post>;
export type PublicUser = App<typeof PublicUser>;
