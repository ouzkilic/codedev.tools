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
// Compare
import { meta as textDiff } from './text-diff/meta';
import { meta as jsonDiff } from './json-diff/meta';
// XML
import { meta as xmlFormatter } from './xml-formatter/meta';
import { meta as xmlMinify } from './xml-minify/meta';
import { meta as xmlToJson } from './xml-to-json/meta';
import { meta as jsonToXml } from './json-to-xml/meta';
// YAML
import { meta as yamlToJson } from './yaml-to-json/meta';
import { meta as jsonToYaml } from './json-to-yaml/meta';
import { meta as yamlValidate } from './yaml-validate/meta';
// CSV
import { meta as csvToJson } from './csv-to-json/meta';
import { meta as jsonToCsv } from './json-to-csv/meta';
// Encode / Decode
import { meta as base64 } from './base64/meta';
import { meta as urlEncode } from './url-encode/meta';
import { meta as htmlEntities } from './html-entities/meta';
import { meta as hex } from './hex/meta';
import { meta as jwtDecode } from './jwt-decode/meta';
// Hash / Crypto
import { meta as hash } from './hash/meta';
import { meta as hmac } from './hmac/meta';
import { meta as md5 } from './md5/meta';
// Text
import { meta as textCase } from './text-case/meta';
import { meta as sortLines } from './sort-lines/meta';
import { meta as dedupeLines } from './dedupe-lines/meta';
import { meta as textStats } from './text-stats/meta';
import { meta as slugify } from './slugify/meta';
// Generators
import { meta as uuid } from './uuid/meta';
import { meta as nanoid } from './nanoid/meta';
import { meta as password } from './password/meta';
import { meta as lorem } from './lorem/meta';
// Date / Time, Number, Color
import { meta as timestamp } from './timestamp/meta';
import { meta as cron } from './cron/meta';
import { meta as baseConvert } from './base-convert/meta';
import { meta as colorConvert } from './color-convert/meta';
// Web / Frontend, Code
import { meta as queryString } from './query-string/meta';
import { meta as urlParser } from './url-parser/meta';
import { meta as cssUnits } from './css-units/meta';
import { meta as sqlFormatter } from './sql-formatter/meta';
// For each new tool, add one import here and one entry to the array.

const metas = [
  jsonFormatter, jsonMinify, jsonValidate, jsonViewer, jsonRepair, jsonSort,
  jsonEscape, jsonFlatten, jsonUnflatten, jsonPath, jsonMerge, jsonToJsonl,
  jsonlToJson, jsonToZod,
  textDiff, jsonDiff,
  xmlFormatter, xmlMinify, xmlToJson, jsonToXml,
  yamlToJson, jsonToYaml, yamlValidate,
  csvToJson, jsonToCsv,
  base64, urlEncode, htmlEntities, hex, jwtDecode,
  hash, hmac, md5,
  textCase, sortLines, dedupeLines, textStats, slugify,
  uuid, nanoid, password, lorem,
  timestamp, cron, baseConvert, colorConvert,
  queryString, urlParser, cssUnits, sqlFormatter,
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
