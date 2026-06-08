import type { ToolLogic } from '@/hooks/useToolState';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

interface Field {
  type: string;
  name: string;
}

interface Message {
  name: string;
  fields: Field[];
}

function pascalCase(name: string): string {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'Field';
}

function scalarType(value: number | boolean | string): string {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') return 'string';
  return Number.isInteger(value) ? 'int64' : 'double';
}

function elementType(value: Json, fieldName: string, messages: Message[]): string {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const msgName = pascalCase(fieldName);
    buildMessage(msgName, value as Record<string, Json>, messages);
    return msgName;
  }
  if (value === null) return 'string';
  if (Array.isArray(value)) {
    const inner = value.length > 0 ? value[0] : '';
    return `repeated ${elementType(inner, fieldName, messages)}`;
  }
  return scalarType(value);
}

function buildMessage(name: string, obj: Record<string, Json>, messages: Message[]): void {
  const fields: Field[] = [];
  for (const [key, value] of Object.entries(obj)) {
    let type: string;
    if (Array.isArray(value)) {
      const inner = value.length > 0 ? value[0] : '';
      type = `repeated ${elementType(inner, key, messages)}`;
    } else if (value !== null && typeof value === 'object') {
      const msgName = pascalCase(key);
      buildMessage(msgName, value as Record<string, Json>, messages);
      type = msgName;
    } else if (value === null) {
      type = 'string';
    } else {
      type = scalarType(value);
    }
    fields.push({ type, name: key });
  }
  messages.push({ name, fields });
}

function renderMessage(message: Message): string {
  const lines = message.fields.map(
    (field, index) => `  ${field.type} ${field.name} = ${index + 1};`,
  );
  return `message ${message.name} {\n${lines.join('\n')}\n}`;
}

export const jsonToProtoLogic: ToolLogic = {
  transform(input: string): string {
    let parsed: Json;
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      throw new Error('Invalid JSON input', { cause: e });
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Input must be a JSON object');
    }
    const messages: Message[] = [];
    buildMessage('Root', parsed as Record<string, Json>, messages);
    const body = messages.map(renderMessage).join('\n\n');
    return `syntax = "proto3";\n\n${body}\n`;
  },
};
