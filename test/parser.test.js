import { describe, expect, it } from 'vitest';

import { parseCommand } from '../src/parser.js';

describe('parseCommand', () => {
  it('accepts a bare product id and quantity', () => {
    expect(parseCommand('1 2')).toEqual({ type: 'add', productId: 1, quantity: 2 });
  });

  it('accepts the explicit add command', () => {
    expect(parseCommand('add 3 4')).toEqual({ type: 'add', productId: 3, quantity: 4 });
  });

  it('recognizes application commands', () => {
    expect(parseCommand('cart')).toEqual({ type: 'cart' });
    expect(parseCommand('total')).toEqual({ type: 'total' });
    expect(parseCommand('checkout')).toEqual({ type: 'checkout' });
    expect(parseCommand('list')).toEqual({ type: 'list' });
    expect(parseCommand('help')).toEqual({ type: 'help' });
    expect(parseCommand('exit')).toEqual({ type: 'exit' });
  });

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(parseCommand('  CHECKOUT  ')).toEqual({ type: 'checkout' });
  });

  it('rejects missing or invalid add arguments', () => {
    expect(parseCommand('add 1')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('1 abc')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('0 2')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('1 -2')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('1 2.5')).toMatchObject({ type: 'invalid' });
  });

  it('rejects unknown commands and unexpected extra arguments', () => {
    expect(parseCommand('unknown')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('checkout now')).toMatchObject({ type: 'invalid' });
    expect(parseCommand('')).toMatchObject({ type: 'invalid' });
  });

  it('rejects non-string input', () => {
    expect(parseCommand(null)).toMatchObject({ type: 'invalid' });
  });
});
