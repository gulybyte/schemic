import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Docs content is authored as MDX under src/content/docs/** (frontmatter:
// title + description). Rendering (chrome, nav, components) is owned by the
// docs shell; see src/pages/docs/[...slug].astro.
export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  }),
};
