import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';

import { runCli } from '../src/cli.js';

async function runCliWithLines(lines) {
  const input = new PassThrough();
  const output = new PassThrough();
  let text = '';

  output.on('data', (chunk) => {
    text += chunk.toString();
  });

  const runPromise = runCli({ input, output });

  for (const line of lines) {
    input.write(`${line}\n`);
    await new Promise((resolve) => setImmediate(resolve));
  }

  input.end();
  await runPromise;
  output.end();

  return text;
}

describe('CLI integration', () => {
  it('adds products, shows the cart and completes checkout', async () => {
    const text = await runCliWithLines(['1 2', 'add 2 1', 'cart', 'total', 'checkout']);

    expect(text).toContain('Added 2 x Apple. Cart total: $2.40');
    expect(text).toContain('Added 1 x Bread. Cart total: $4.90');
    expect(text).toContain('2 x Apple = $2.40');
    expect(text).toContain('1 x Bread = $2.50');
    expect(text).toContain('Cart total: $4.90');
    expect(text).toContain('Checkout successful.');
    expect(text).toContain('Total paid: $4.90');
    expect(text).toContain('Apple: 8');
    expect(text).toContain('Bread: 4');
  });

  it('handles invalid products, overstock and empty checkout without ending the loop', async () => {
    const text = await runCliWithLines(['99 1', '2 10', 'checkout', 'cart', 'exit']);

    expect(text).toContain('Error: Product with id 99 does not exist.');
    expect(text).toContain('Error: Only 5 unit(s) of Bread are available.');
    expect(text).toContain('Error: Cannot check out an empty cart.');
    expect(text).toContain('Your cart is empty.');
    expect(text).toContain('Goodbye.');
  });

  it('shows help and the product list again on request', async () => {
    const text = await runCliWithLines(['unknown', 'help', 'list', 'exit']);

    expect(text).toContain('Invalid input: Unknown command: unknown');
    expect(text).toContain('Commands:');
    expect(text).toContain('[5] Coffee');
    expect(text).toContain('Goodbye.');
  });

  it('exits cleanly when the input stream closes', async () => {
    const text = await runCliWithLines([]);

    expect(text).toContain('Input closed. Goodbye.');
  });
});
