const APPLICATION_COMMANDS = new Set(['cart', 'total', 'checkout', 'list', 'help', 'exit']);

function invalid(message) {
  return { type: 'invalid', message };
}

function parsePositiveInteger(token) {
  if (typeof token !== 'string' || !/^\d+$/.test(token)) {
    return null;
  }

  const value = Number(token);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function createAddCommand(productIdToken, quantityToken) {
  const productId = parsePositiveInteger(productIdToken);
  const quantity = parsePositiveInteger(quantityToken);

  if (productId === null) {
    return invalid('Product id must be a positive integer.');
  }

  if (quantity === null) {
    return invalid('Quantity must be a positive integer.');
  }

  return { type: 'add', productId, quantity };
}

/**
 * Parses one CLI input line.
 *
 * Supported forms:
 * - "1 2" or "add 1 2": add two units of product 1.
 * - cart, total, checkout, list, help, exit.
 */
export function parseCommand(input) {
  if (typeof input !== 'string') {
    return invalid('Input must be a string.');
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    return invalid('Input cannot be empty.');
  }

  const tokens = trimmed.split(/\s+/);
  const command = tokens[0].toLowerCase();

  if (command === 'add') {
    if (tokens.length !== 3) {
      return invalid('Usage: add <productId> <quantity>.');
    }
    return createAddCommand(tokens[1], tokens[2]);
  }

  if (APPLICATION_COMMANDS.has(command)) {
    if (tokens.length !== 1) {
      return invalid(`Command "${command}" does not take arguments.`);
    }
    return { type: command };
  }

  if (tokens.length === 2 && parsePositiveInteger(tokens[0]) !== null) {
    return createAddCommand(tokens[0], tokens[1]);
  }

  return invalid(`Unknown command: ${tokens[0]}. Type "help" for available commands.`);
}
