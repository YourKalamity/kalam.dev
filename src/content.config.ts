import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    shortDescription: z.string(),
    icon: z.string(),
    order: z.number(),
    liveLink: z.string().url().nullable().default(null),
    sourceLink: z.string().url().nullable().default(null),
    bannerImage: z.string().nullable().default(null),
    bannerVideo: z.string().nullable().default(null),
    bannerPoster: z.string().nullable().default(null),
    tags: z.array(z.string()).default([]),
    tldr: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
