import { argon2id } from 'hash-wasm';
import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const argon2Logic: AsyncToolLogic = {
  async transform(input) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return argon2id({
      password: input,
      salt,
      parallelism: 1,
      iterations: 3,
      memorySize: 4096,
      hashLength: 32,
      outputType: 'encoded',
    });
  },
};
