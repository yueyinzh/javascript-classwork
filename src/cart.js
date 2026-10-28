const CURRENCY_PRECISION = 100;

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * CURRENCY_PRECISION) / CURRENCY_PRECISION;
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer.`);
  }
}

export function createCart() {
  return [];
}

export function findProductById(products, productId) {
  return products.find((product) => product.id === productId);
}

/**
 * Adds a product to the cart.
 *
 * Assumptions:
 * - Product ids and quantities are positive integers.
 * - Adding the same product again merges the quantities into one cart line.
 * - Stock is not reduced until a successful checkout.
 */
export function addProductToCart(cart, products, productId, quantity) {
  assertPositiveInteger(productId, 'Product id');
  assertPositiveInteger(quantity, 'Quantity');

  const product = findProductById(products, productId);
  if (!product) {
    throw new Error(`Product with id ${productId} does not exist.`);
  }

  const existingItem = cart.find((item) => item.productId === productId);
  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (newQuantity > product.quantityAvailable) {
    throw new RangeError(
      `Only ${product.quantityAvailable} unit(s) of ${product.name} are available.`
    );
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.totalPrice = roundCurrency(product.price * newQuantity);
  } else {
    cart.push({
      productId,
      quantity,
      totalPrice: roundCurrency(product.price * quantity)
    });
  }

  return cart;
}

export function calculateTotal(cart) {
  return roundCurrency(cart.reduce((total, item) => total + item.totalPrice, 0));
}

/**
 * Completes the purchase and reduces available stock.
 *
 * Assumptions:
 * - Checkout is rejected for an empty cart.
 * - Checkout is atomic: if any line is invalid, no stock is changed.
 * - A successful checkout returns a receipt and clears the cart.
 */
export function checkoutCart(cart, products) {
  if (cart.length === 0) {
    throw new Error('Cannot check out an empty cart.');
  }

  const validatedItems = cart.map((item) => {
    const product = findProductById(products, item.productId);

    if (!product) {
      throw new Error(`Product with id ${item.productId} does not exist.`);
    }

    assertPositiveInteger(item.quantity, 'Cart quantity');

    if (item.quantity > product.quantityAvailable) {
      throw new RangeError(
        `Only ${product.quantityAvailable} unit(s) of ${product.name} are available.`
      );
    }

    return { item, product };
  });

  for (const { item, product } of validatedItems) {
    product.quantityAvailable -= item.quantity;
  }

  const receipt = {
    items: cart.map((item) => ({ ...item })),
    total: calculateTotal(cart)
  };

  cart.splice(0, cart.length);
  return receipt;
}
