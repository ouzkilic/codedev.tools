import { lazy } from 'react';
import { meta as jsonFormatter } from './json-formatter/meta';
import { meta as jsonMinify } from './json-minify/meta';
import { meta as jsonSort } from './json-sort/meta';
import { meta as jsonFlatten } from './json-flatten/meta';
import { meta as jsonToJsonl } from './json-to-jsonl/meta';
import { meta as jsonToZod } from './json-to-zod/meta';
// For each new tool, add one import here and one entry to the array.

const metas = [jsonFormatter, jsonMinify, jsonSort, jsonFlatten, jsonToJsonl, jsonToZod];

export const tools = metas.map((m) => ({
  ...m,
  Component: lazy(m.load),
}));

export type RegistryTool = (typeof tools)[number];

export const findTool = (id: string) => tools.find((t) => t.id === id);

export const searchTools = (q: string) => {
  const query = q.trim().toLowerCase();
  if (!query) return tools;
  return tools.filter((t) =>
    [t.title, t.description, ...t.keywords].join(' ').toLowerCase().includes(query),
  );
};
