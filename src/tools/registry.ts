import { lazy } from 'react';
import { meta as jsonFormatter } from './json-formatter/meta';
import { meta as jsonMinify } from './json-minify/meta';
import { meta as jsonValidate } from './json-validate/meta';
import { meta as jsonViewer } from './json-viewer/meta';
import { meta as jsonRepair } from './json-repair/meta';
import { meta as jsonSort } from './json-sort/meta';
import { meta as jsonEscape } from './json-escape/meta';
import { meta as jsonFlatten } from './json-flatten/meta';
import { meta as jsonUnflatten } from './json-unflatten/meta';
import { meta as jsonPath } from './json-path/meta';
import { meta as jsonMerge } from './json-merge/meta';
import { meta as jsonToJsonl } from './json-to-jsonl/meta';
import { meta as jsonlToJson } from './jsonl-to-json/meta';
import { meta as jsonToZod } from './json-to-zod/meta';
// For each new tool, add one import here and one entry to the array.

const metas = [
  jsonFormatter, jsonMinify, jsonValidate, jsonViewer, jsonRepair, jsonSort,
  jsonEscape, jsonFlatten, jsonUnflatten, jsonPath, jsonMerge, jsonToJsonl,
  jsonlToJson, jsonToZod,
];

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
