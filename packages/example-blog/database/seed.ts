import { RecordId, type Surreal } from "surrealdb";

/** Run with `schemic seed`. Receives a connected client. */
export default async function seed(db: Surreal) {
  const ada = await db.create(new RecordId("user", "ada")).content({
    name: "Ada Lovelace",
    email: "ada@example.com",
    bio: "Writing about computing.",
  });

  const post = await db.create(new RecordId("post", "hello-schemic")).content({
    title: "Hello, Schemic",
    slug: "hello-schemic",
    body: "Schema-as-code for any database.",
    author: ada.id,
    status: "published",
    tags: ["intro", "schemic"],
    publishedAt: new Date(),
  });

  await db.create(new RecordId("comment", "first")).content({
    post: post.id,
    author: ada.id,
    body: "Great first post!",
  });
}
