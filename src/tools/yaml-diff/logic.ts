import { diffLines, type Change } from 'diff';
import yaml from 'js-yaml';

// Re-dump with sorted keys so key order and formatting don't show as differences.
export function normalizeYaml(text: string): string {
  return yaml.dump(yaml.load(text), { sortKeys: true });
}

export function computeYamlDiff(left: string, right: string): Change[] {
  return diffLines(normalizeYaml(left), normalizeYaml(right));
}
