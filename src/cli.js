import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

import {
  addProductToCart,
  calculateTotal,
  checkoutCart,
  createCart,
  findProductById
} from './cart.js';
import { formatCurrency } from './format.js';
import { parseCommand } from './parser.js';
import { createProducts } from './products.js';

const HELP_TEXT = `
Commands:
  <productId> <quantity>   Add a product, for example: 1 2
  add <productId> <quantity>
  cart                     Show the current cart
  total                    Show the cart total
  checkout                 Pay for the cart and update stock
  list                     Show the product list again
  help                     Show this help text
  exit                     Quit without checkout
`;

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function printProductList(products, output) {
  output.write('\nAvailable products:\n');
  for (const product of products) {
    output.write(
      `  [${product.id}] ${product.name.padEnd(10)} ` +
      `${formatCurrency(product.price)}  stock: ${product.quantityAvailable}  ` +
      `${product.description}\n`
    );
  }
}

function printStock(products, output) {
  for (const product of products) {
    output.write(`  ${product.name}: ${product.quantityAvailable}\n`);
  }
}

function printCart(cart, products, output) {
  if (cart.length === 0) {
    output.write('Your cart is empty.\n');
    return;
  }

  output.write('Cart contents:\n');
  for (const item of cart) {
    const product = findProductById(products, item.productId);
    output.write(
      `  ${item.quantity} x ${product.name} = ${formatCurrency(item.totalPrice)}\n`
    );
  }
  output.write(`Cart total: ${formatCurrency(calculateTotal(cart))}\n`);
}

/**
 * Runs the interactive command-line shopping cart.
 * Readline streams can be injected to make the CLI easier to test.
 */
export async function runCli({ input = stdin, output = stdout } = {}) {
  const readline = createInterface({ input, output });
  const products = createProducts();
  const cart = createCart();
  let keepRunning = true;

  output.write('CLI Shopping Cart\n');
  printProductList(products, output);
  output.write(HELP_TEXT);
  readline.setPrompt('\nEnter command: ');
  readline.prompt();

  try {
    for await (const answer of readline) {
      const command = parseCommand(answer);

      switch (command.type) {
        case 'add': {
          try {
            addProductToCart(cart, products, command.productId, command.quantity);
            const product = findProductById(products, command.productId);
            output.write(
              `Added ${command.quantity} x ${product.name}. ` +
              `Cart total: ${formatCurrency(calculateTotal(cart))}\n`
            );
          } catch (error) {
            output.write(`Error: ${errorMessage(error)}\n`);
          }
          break;
        }

        case 'cart':
          printCart(cart, products, output);
          break;

        case 'total':
          output.write(`Cart total: ${formatCurrency(calculateTotal(cart))}\n`);
          break;

        case 'checkout': {
          try {
            const receipt = checkoutCart(cart, products);
            output.write('Checkout successful.\nReceipt:\n');

            for (const item of receipt.items) {
              const product = findProductById(products, item.productId);
              output.write(
                `  ${item.quantity} x ${product.name} = ${formatCurrency(item.totalPrice)}\n`
              );
            }

            output.write(`Total paid: ${formatCurrency(receipt.total)}\n`);
            output.write('Updated stock:\n');
            printStock(products, output);
            keepRunning = false;
          } catch (error) {
            output.write(`Error: ${errorMessage(error)}\n`);
          }
          break;
        }

        case 'list':
          printProductList(products, output);
          break;

        case 'help':
          output.write(HELP_TEXT);
          break;

        case 'exit':
          output.write('Goodbye.\n');
          keepRunning = false;
          break;

        default:
          output.write(`Invalid input: ${command.message}\n`);
          break;
      }

      if (!keepRunning) {
        break;
      }

      readline.prompt();
    }

    if (keepRunning) {
      output.write('\nInput closed. Goodbye.\n');
    }
  } finally {
    readline.close();
  }
}
