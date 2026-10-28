# BTH012 Assignment 1 - Command-line Shopping Cart

A small, testable shopping cart that runs in the terminal using Node.js.
The application uses only Node.js built-in modules in the runtime code and
Vitest for unit tests.

## Project structure

```text
bth012-a1/
  src/
    cart.js        Cart domain logic
    cli.js         Interactive readline command-line interface
    format.js      Currency formatting
    index.js       Application entry point
    parser.js      CLI command parser
    products.js    Initial product catalogue
  test/
    cart.test.js
    cli.test.js
    format.test.js
    parser.test.js
  .dockerignore
  .gitattributes
  Dockerfile
  package.json
  vitest.config.js
```

## Run the application

```bash
npm install
npm start
```

The product catalogue is printed at startup. Enter a product id and quantity,
for example `1 2`, or use one of these commands:

```text
1 2                      Add two units of product 1
add 1 2                  Same as the line above
cart                     Show the current cart
total                    Show the cart total
checkout                 Pay, calculate the total and reduce stock
list                     Show the product list again
help                     Show the command help
exit                     Quit without checkout
```

## Run the tests

```bash
npm install
npm test
# Alternative command used by the course instructions:
npm run tests
```

The tests cover adding products, merging repeated additions, invalid product
ids, quantities above available stock, invalid quantities, empty-cart checkout,
checkout stock reduction, total calculation, monetary rounding, checkout
atomicity, command parsing, currency formatting and CLI integration.

## Docker and GitHub submission

The course template builds the image by cloning the public GitHub repository
`https://github.com/yueyinzh/javascript-classwork.git` from the URL in
`Dockerfile`. The repository must be public so the course checker can clone it
inside the Docker build.

```bash
docker build --no-cache -t assignment1 .
docker run --rm -it assignment1
``` 

The application uses only Node.js built-in modules at runtime, so the Docker image does not need to install runtime dependencies.

## Assumptions

The assignment allows realistic assumptions when the specification is open to
interpretation. The implementation and tests use these assumptions:

1. Product ids and quantities are positive integers.
2. Adding the same product to the cart more than once merges the additions into
   one cart line. Its `totalPrice` is recalculated as `product.price * quantity`.
3. Product stock is only decreased by a successful checkout. Adding a product
   to the cart does not reserve or reduce stock immediately.
4. Checkout is rejected for an empty cart.
5. Checkout is atomic: if any cart line has become invalid, no stock is changed.
6. A successful checkout returns a receipt, reduces stock and clears the cart.
7. The CLI loop ends after a successful checkout or after the `exit` command.
   Failed checkout attempts leave the loop running so the user can fix the cart.
8. Prices are displayed in US dollars and monetary results are rounded to two
   decimal places.

## Error handling

The cart functions throw descriptive errors for invalid input. The CLI catches
these errors, prints the message and continues the loop without changing the
cart. This keeps domain rules testable while allowing the user to recover from
mistakes.



