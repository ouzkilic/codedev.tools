import type { Faker } from '@faker-js/faker';

export const FAKE_TYPES = [
  'fullName', 'firstName', 'email', 'username', 'url', 'phone',
  'address', 'city', 'country', 'company', 'jobTitle',
  'uuid', 'sentence', 'paragraph', 'date', 'number', 'boolean', 'color',
] as const;

export function fakeValue(faker: Faker, type: string): string {
  switch (type) {
    case 'firstName': return faker.person.firstName();
    case 'email': return faker.internet.email();
    case 'username': return faker.internet.username();
    case 'url': return faker.internet.url();
    case 'phone': return faker.phone.number();
    case 'address': return faker.location.streetAddress();
    case 'city': return faker.location.city();
    case 'country': return faker.location.country();
    case 'company': return faker.company.name();
    case 'jobTitle': return faker.person.jobTitle();
    case 'uuid': return faker.string.uuid();
    case 'sentence': return faker.lorem.sentence();
    case 'paragraph': return faker.lorem.paragraph();
    case 'date': return faker.date.past().toISOString();
    case 'number': return String(faker.number.int({ min: 0, max: 100000 }));
    case 'boolean': return String(faker.datatype.boolean());
    case 'color': return faker.color.rgb();
    default: return faker.person.fullName();
  }
}

// Heavy lib: dynamically imported so it only loads when this tool runs.
export async function generateFake(type: string, count: number): Promise<string> {
  const { faker } = await import('@faker-js/faker');
  return Array.from({ length: count }, () => fakeValue(faker, type)).join('\n');
}
