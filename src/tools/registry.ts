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
import { meta as jsonToTs } from './json-to-ts/meta';
import { meta as jsonToJsonSchema } from './json-to-jsonschema/meta';
// Compare
import { meta as textDiff } from './text-diff/meta';
import { meta as jsonDiff } from './json-diff/meta';
import { meta as xmlDiff } from './xml-diff/meta';
import { meta as yamlDiff } from './yaml-diff/meta';
import { meta as listCompare } from './list-compare/meta';
// XML
import { meta as xmlFormatter } from './xml-formatter/meta';
import { meta as xmlMinify } from './xml-minify/meta';
import { meta as xmlToJson } from './xml-to-json/meta';
import { meta as jsonToXml } from './json-to-xml/meta';
// YAML / TOML
import { meta as yamlToJson } from './yaml-to-json/meta';
import { meta as jsonToYaml } from './json-to-yaml/meta';
import { meta as yamlValidate } from './yaml-validate/meta';
import { meta as tomlToJson } from './toml-to-json/meta';
import { meta as jsonToToml } from './json-to-toml/meta';
// Markdown
import { meta as markdownToHtml } from './markdown-to-html/meta';
import { meta as htmlToMarkdown } from './html-to-markdown/meta';
// CSV
import { meta as csvToJson } from './csv-to-json/meta';
import { meta as jsonToCsv } from './json-to-csv/meta';
import { meta as csvToMarkdown } from './csv-to-markdown/meta';
import { meta as csvToSql } from './csv-to-sql/meta';
import { meta as csvTsv } from './csv-tsv/meta';
import { meta as excelToCsv } from './excel-to-csv/meta';
import { meta as excelToJson } from './excel-to-json/meta';
// Encode / Decode
import { meta as base64 } from './base64/meta';
import { meta as urlEncode } from './url-encode/meta';
import { meta as htmlEntities } from './html-entities/meta';
import { meta as hex } from './hex/meta';
import { meta as jwtDecode } from './jwt-decode/meta';
import { meta as binary } from './binary/meta';
import { meta as base32 } from './base32/meta';
import { meta as base58 } from './base58/meta';
import { meta as base62 } from './base62/meta';
import { meta as quotedPrintable } from './quoted-printable/meta';
import { meta as unicodeEscape } from './unicode-escape/meta';
// Hash / Crypto
import { meta as hash } from './hash/meta';
import { meta as hmac } from './hmac/meta';
import { meta as md5 } from './md5/meta';
import { meta as fileHash } from './file-hash/meta';
import { meta as crc32 } from './crc32/meta';
// Image
import { meta as imageBase64 } from './image-base64/meta';
// Text
import { meta as textCase } from './text-case/meta';
import { meta as sortLines } from './sort-lines/meta';
import { meta as dedupeLines } from './dedupe-lines/meta';
import { meta as textStats } from './text-stats/meta';
import { meta as slugify } from './slugify/meta';
import { meta as stringEscape } from './string-escape/meta';
import { meta as reverse } from './reverse/meta';
import { meta as whitespace } from './whitespace/meta';
import { meta as wordFreq } from './word-freq/meta';
import { meta as findReplace } from './find-replace/meta';
// Regex
import { meta as regexTester } from './regex-tester/meta';
// Generators
import { meta as uuid } from './uuid/meta';
import { meta as nanoid } from './nanoid/meta';
import { meta as password } from './password/meta';
import { meta as lorem } from './lorem/meta';
import { meta as qr } from './qr/meta';
import { meta as faker } from './faker/meta';
import { meta as ulid } from './ulid/meta';
// Date / Time, Number, Color
import { meta as timestamp } from './timestamp/meta';
import { meta as dateDiff } from './date-diff/meta';
import { meta as cron } from './cron/meta';
import { meta as baseConvert } from './base-convert/meta';
import { meta as colorConvert } from './color-convert/meta';
import { meta as contrast } from './contrast/meta';
import { meta as cssGradient } from './css-gradient/meta';
import { meta as boxShadow } from './box-shadow/meta';
import { meta as byteSize } from './byte-size/meta';
import { meta as roman } from './roman/meta';
// Web / Frontend, Code
import { meta as queryString } from './query-string/meta';
import { meta as urlParser } from './url-parser/meta';
import { meta as cssUnits } from './css-units/meta';
import { meta as sqlFormatter } from './sql-formatter/meta';
// Network
import { meta as subnet } from './subnet/meta';
import { meta as userAgent } from './user-agent/meta';
// Reference (misc)
import { meta as httpStatus } from './http-status/meta';
import { meta as mimeTypes } from './mime-types/meta';
import { meta as charInfo } from './char-info/meta';
import { meta as envToJson } from './env-to-json/meta';
import { meta as jsonToEnv } from './json-to-env/meta';
// Batch: native tools
import { meta as xmlValidate } from './xml-validate/meta';
import { meta as yamlFormatter } from './yaml-formatter/meta';
import { meta as yamlToToml } from './yaml-to-toml/meta';
import { meta as tomlToYaml } from './toml-to-yaml/meta';
import { meta as csvToHtml } from './csv-to-html/meta';
import { meta as csvToXml } from './csv-to-xml/meta';
import { meta as adler32 } from './adler32/meta';
import { meta as rot13 } from './rot13/meta';
import { meta as morse } from './morse/meta';
import { meta as invisibleChars } from './invisible-chars/meta';
import { meta as textRepeat } from './text-repeat/meta';
import { meta as numberToWords } from './number-to-words/meta';
import { meta as unitConvert } from './unit-convert/meta';
import { meta as aspectRatio } from './aspect-ratio/meta';
// Batch 2: native tools
import { meta as wordsToNumber } from './words-to-number/meta';
import { meta as percentage } from './percentage/meta';
import { meta as numberFormat } from './number-format/meta';
import { meta as padTruncate } from './pad-truncate/meta';
import { meta as htmlStrip } from './html-strip/meta';
import { meta as leetspeak } from './leetspeak/meta';
import { meta as durationFormat } from './duration-format/meta';
import { meta as timezone } from './timezone/meta';
import { meta as dateInfo } from './date-info/meta';
import { meta as csvToYaml } from './csv-to-yaml/meta';
import { meta as csvTranspose } from './csv-transpose/meta';
import { meta as propertiesToJson } from './properties-to-json/meta';
import { meta as jsonToProperties } from './json-to-properties/meta';
import { meta as base64url } from './base64url/meta';
// Batch 3: generators + minifiers + validators
import { meta as metaTags } from './meta-tags/meta';
import { meta as gitignore } from './gitignore/meta';
import { meta as robotsTxt } from './robots-txt/meta';
import { meta as cubicBezier } from './cubic-bezier/meta';
import { meta as colorPalette } from './color-palette/meta';
import { meta as htmlMinify } from './html-minify/meta';
import { meta as cssMinify } from './css-minify/meta';
import { meta as uuidValidate } from './uuid-validate/meta';
import { meta as charcode } from './charcode/meta';
import { meta as sqlMinify } from './sql-minify/meta';
// Stage 1-4 remaining
import { meta as jsonPatch } from './json-patch/meta';
import { meta as tomlFormatter } from './toml-formatter/meta';
import { meta as csvValidate } from './csv-validate/meta';
import { meta as xmlToYaml } from './xml-to-yaml/meta';
import { meta as yamlToXml } from './yaml-to-xml/meta';
import { meta as htmlToJsx } from './html-to-jsx/meta';
import { meta as jsonSchemaToJson } from './jsonschema-to-json/meta';
import { meta as jsonToGraphql } from './json-to-graphql/meta';
import { meta as jsonToProto } from './json-to-proto/meta';
import { meta as punycode } from './punycode/meta';
import { meta as sqlDdlToTs } from './sql-ddl-to-ts/meta';
import { meta as csvDiff } from './csv-diff/meta';
import { meta as htmlDiff } from './html-diff/meta';
import { meta as graphqlFormat } from './graphql-format/meta';
import { meta as jsonToTypes } from './json-to-types/meta';
// Bespoke Stage 1-4 remainder
import { meta as prettierFormat } from './prettier-format/meta';
import { meta as markdownPreview } from './markdown-preview/meta';
import { meta as jsonToExcel } from './json-to-excel/meta';
import { meta as base64ToFile } from './base64-to-file/meta';
import { meta as xpath } from './xpath/meta';
// Stage 1-4 final
import { meta as csvViewer } from './csv-viewer/meta';
import { meta as tsvViewer } from './tsv-viewer/meta';
import { meta as jsonSchemaToTs } from './jsonschema-to-ts/meta';
import { meta as tsToJsonSchema } from './ts-to-jsonschema/meta';
import { meta as tsToZod } from './ts-to-zod/meta';
import { meta as zodToTs } from './zod-to-ts/meta';
import { meta as zodToJsonSchema } from './zod-to-jsonschema/meta';
import { meta as openapiToTs } from './openapi-to-ts/meta';
import { meta as sqlDdlToPrisma } from './sql-ddl-to-prisma/meta';
// Stage 5 (crypto) + Stage 11/Network
import { meta as pbkdf2 } from './pbkdf2/meta';
import { meta as aes } from './aes/meta';
import { meta as bcrypt } from './bcrypt/meta';
import { meta as argon2 } from './argon2/meta';
import { meta as hashId } from './hash-id/meta';
import { meta as ipConvert } from './ip-convert/meta';
import { meta as macFormat } from './mac-format/meta';
import { meta as httpHeaders } from './http-headers/meta';
import { meta as basicAuth } from './basic-auth/meta';
import { meta as keycode } from './keycode/meta';
import { meta as emoji } from './emoji/meta';
import { meta as entityReference } from './entity-reference/meta';
import { meta as crontabCheatsheet } from './crontab-cheatsheet/meta';
import { meta as regexCheatsheet } from './regex-cheatsheet/meta';
import { meta as gitCheatsheet } from './git-cheatsheet/meta';
// Stage 8 web
import { meta as tailwindHints } from './tailwind-hints/meta';
import { meta as svgOptimize } from './svg-optimize/meta';
import { meta as svgToJsx } from './svg-to-jsx/meta';
import { meta as curlToCode } from './curl-to-code/meta';
import { meta as highlight } from './highlight/meta';
// Stage 10 image
import { meta as imageConvert } from './image-convert/meta';
import { meta as imageResize } from './image-resize/meta';
import { meta as imageAscii } from './image-ascii/meta';
import { meta as favicon } from './favicon/meta';
import { meta as exif } from './exif/meta';
import { meta as imageColors } from './image-colors/meta';
import { meta as qrDecode } from './qr-decode/meta';
import { meta as imageDiff } from './image-diff/meta';
import { meta as keygen } from './keygen/meta';
import { meta as codeImage } from './code-image/meta';
// Roadmap remainder
import { meta as regexExplain } from './regex-explain/meta';
import { meta as cronNext } from './cron-next/meta';
import { meta as relativeTime } from './relative-time/meta';
import { meta as mockJson } from './mock-json/meta';
import { meta as asciiArt } from './ascii-art/meta';
import { meta as random } from './random/meta';
import { meta as testData } from './test-data/meta';
import { meta as token } from './token/meta';
import { meta as colorPicker } from './color-picker/meta';
import { meta as barcode } from './barcode/meta';
// For each new tool, add one import here and one entry to the array.

const metas = [
  jsonFormatter, jsonMinify, jsonValidate, jsonViewer, jsonRepair, jsonSort,
  jsonEscape, jsonFlatten, jsonUnflatten, jsonPath, jsonMerge, jsonToJsonl,
  jsonlToJson, jsonToZod, jsonToTs, jsonToJsonSchema, jsonToTypes, jsonSchemaToJson, jsonToGraphql, jsonToProto, sqlDdlToTs, jsonPatch,
  jsonSchemaToTs, tsToJsonSchema, tsToZod, zodToTs, zodToJsonSchema, openapiToTs, sqlDdlToPrisma, mockJson,
  textDiff, jsonDiff, xmlDiff, yamlDiff, csvDiff, htmlDiff, listCompare,
  xmlFormatter, xmlMinify, xmlToJson, jsonToXml, xmlValidate, xmlToYaml, yamlToXml, xpath,
  yamlToJson, jsonToYaml, yamlValidate, tomlToJson, jsonToToml, yamlFormatter, yamlToToml, tomlToYaml, tomlFormatter,
  markdownToHtml, htmlToMarkdown, markdownPreview,
  csvToJson, jsonToCsv, csvToMarkdown, csvToSql, csvTsv, excelToCsv, excelToJson, jsonToExcel, csvToHtml, csvToXml, csvToYaml, csvTranspose, csvValidate, csvViewer, tsvViewer,
  base64, urlEncode, htmlEntities, hex, jwtDecode, binary, base32, base58, base62, base64url, quotedPrintable, unicodeEscape, charcode, punycode,
  hash, hmac, md5, fileHash, crc32, adler32, pbkdf2, aes, bcrypt, argon2, hashId, keygen, imageBase64, base64ToFile,
  imageConvert, imageResize, imageAscii, favicon, exif, imageColors, qrDecode, imageDiff, codeImage,
  textCase, sortLines, dedupeLines, textStats, slugify, stringEscape, reverse, whitespace, wordFreq, findReplace,
  rot13, morse, invisibleChars, textRepeat, padTruncate, htmlStrip, leetspeak, asciiArt,
  regexTester, regexCheatsheet, regexExplain,
  uuid, nanoid, password, lorem, qr, faker, ulid, colorPalette, random, testData, token, barcode,
  timestamp, dateDiff, cron, cronNext, relativeTime, baseConvert, colorConvert, colorPicker, contrast, cssGradient, boxShadow, cubicBezier, byteSize, roman,
  numberToWords, unitConvert, aspectRatio, wordsToNumber, percentage, numberFormat,
  durationFormat, timezone, dateInfo, crontabCheatsheet,
  queryString, urlParser, cssUnits, sqlFormatter, metaTags, robotsTxt, htmlMinify, cssMinify, sqlMinify, htmlToJsx, graphqlFormat, prettierFormat,
  tailwindHints, svgOptimize, svgToJsx, curlToCode, highlight,
  subnet, userAgent, ipConvert, macFormat, httpHeaders, basicAuth,
  httpStatus, mimeTypes, charInfo, envToJson, jsonToEnv, propertiesToJson, jsonToProperties, gitignore, uuidValidate,
  keycode, emoji, entityReference, gitCheatsheet,
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
