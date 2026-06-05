import { diffLines, type Change } from 'diff';
import xmlFormat from 'xml-formatter';

export function normalizeXml(xml: string): string {
  return xmlFormat(xml, { collapseContent: true, indentation: '  ', lineSeparator: '\n' });
}

export function computeXmlDiff(left: string, right: string): Change[] {
  return diffLines(`${normalizeXml(left)}\n`, `${normalizeXml(right)}\n`);
}
