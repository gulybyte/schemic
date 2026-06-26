-- schemic:up
CREATE TABLE "user" (
  "id" text PRIMARY KEY,
  "age" smallint,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "email" varchar(255) NOT NULL,
  "name" text NOT NULL
);
CREATE UNIQUE INDEX "user_email_key" ON "user" ("email");

-- schemic:down
DROP INDEX IF EXISTS "user_email_key";
DROP TABLE IF EXISTS "user" CASCADE;
