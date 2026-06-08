import type { ToolLogic } from '@/hooks/useToolState';
import { parse, print } from 'graphql';

export const graphqlFormatLogic: ToolLogic = {
  transform(input) {
    try {
      return print(parse(input));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid GraphQL';
      throw new Error(msg, { cause: e });
    }
  },
};
