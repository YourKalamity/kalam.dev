// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

function rehypeLazyMedia() {
  /** @param {any} node */
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      node.properties ??= {};
      node.properties.loading ??= 'lazy';
      node.properties.decoding ??= 'async';
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

export default defineConfig({
  site: 'https://kalam.dev',
  trailingSlash: 'ignore',

  devToolbar: { enabled: false },
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [rehypeLazyMedia],
  },
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      target: 'es2022',
    },
  },
});
