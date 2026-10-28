import { beforeEach, describe, expect, it } from 'vitest';

import {
  addProductToCart,
  calculateTotal,
  checkoutCart,
  createCart,
  findProductById
} from '../src/cart.js';

function createTestProducts() {
  return [
    { id: 1, name: 'Apple', description: 'Fresh apple', price: 1.5, quantityAvailable: 10 },
    { id: 2, name: 'Bread', description: 'Whole grain bread', price: 2.25, quantityAvailable: 3 },
    { id: 3, name: 'Milk', description: 'Milk carton', price: 0.95, quantityAvailable: 0 }
  ];
}

describe('cart domain', () => {
  let products;
  let cart;

  beforeEach(() => {
    products = createTestProducts();
    cart = createCart();
  });

  it('creates an empty cart', () => {
    expect(cart).toEqual([]);
  });

  it('finds a product by its numeric id', () => {
    expect(findProductById(products, 2)).toMatchObject({ name: 'Bread' });
    expect(findProductById(products, 99)).toBeUndefined();
  });

  it('adds a product with productId, quantity and totalPrice', () => {
    addProductToCart(cart, products, 1, 2);

    expect(cart).toEqual([
      { productId: 1, quantity: 2, totalPrice: 3 }
    ]);
  });

  // Assumption: repeated additions of the same product are merged into one cart line.
  it('merges repeated additions and recalculates the line total', () => {
    addProductToCart(cart, products, 1, 2);
    addProductToCart(cart, products, 1, 1);

    expect(cart).toEqual([
      { productId: 1, quantity: 3, totalPrice: 4.5 }
    ]);
  });

  it('rejects a product id that does not exist', () => {
    expect(() => addProductToCart(cart, products, 99, 1))
      .toThrow(/does not exist/i);
    expect(cart).toEqual([]);
  });

  it('rejects quantities larger than the available stock', () => {
    expect(() => addProductToCart(cart, products, 2, 4))
      .toThrow(/only 3 unit/i);
    expect(cart).toEqual([]);
  });

  it('rejects zero, negative and non-integer quantities', () => {
    expect(() => addProductToCart(cart, products, 1, 0)).toThrow(RangeError);
    expect(() => addProductToCart(cart, products, 1, -1)).toThrow(RangeError);
    expect(() => addProductToCart(cart, products, 1, 1.5)).toThrow(RangeError);
    expect(cart).toEqual([]);
  });

  it('does not exceed stock when the same product is added repeatedly', () => {
    addProductToCart(cart, products, 1, 8);

    expect(() => addProductToCart(cart, products, 1, 3))
      .toThrow(/only 10 unit/i);
    expect(cart[0]).toEqual({ productId: 1, quantity: 8, totalPrice: 12 });
  });

  it('calculates the total cost of the cart', () => {
    addProductToCart(cart, products, 1, 2);
    addProductToCart(cart, products, 2, 1);

    expect(calculateTotal(cart)).toBe(5.25);
  });

  it('rounds monetary values to two decimals', () => {
    products = [
      { id: 7, name: 'Candy', description: 'Single candy', price: 0.1, quantityAvailable: 10 }
    ];

    addProductToCart(cart, products, 7, 3);

    expect(cart[0].totalPrice).toBe(0.3);
    expect(calculateTotal(cart)).toBe(0.3);
  });

  it('rejects checkout when the cart is empty', () => {
    expect(() => checkoutCart(cart, products))
      .toThrow(/empty cart/i);
  });

  it('reduces stock, returns a receipt and clears the cart on checkout', () => {
    addProductToCart(cart, products, 1, 2);
    addProductToCart(cart, products, 2, 1);

    const receipt = checkoutCart(cart, products);

    expect(receipt).toEqual({
      items: [
        { productId: 1, quantity: 2, totalPrice: 3 },
        { productId: 2, quantity: 1, totalPrice: 2.25 }
      ],
      total: 5.25
    });
    expect(products.find((product) => product.id === 1).quantityAvailable).toBe(8);
    expect(products.find((product) => product.id === 2).quantityAvailable).toBe(2);
    expect(cart).toEqual([]);
  });

  // Checkout must be atomic: no stock is changed if any cart line is invalid.
  it('does not change stock when checkout validation fails', () => {
    cart.push({ productId: 2, quantity: 5, totalPrice: 11.25 });

    expect(() => checkoutCart(cart, products))
      .toThrow(/only 3 unit/i);
    expect(products.find((product) => product.id === 2).quantityAvailable).toBe(3);
    expect(cart).toHaveLength(1);
  });
});

