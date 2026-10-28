/**
 * Creates a fresh product catalogue so that checkout tests and CLI runs
 * cannot accidentally share mutated stock values.
 */
export function createProducts() {
  return [
    { id: 1, name: 'Apple', description: 'Fresh red apple', price: 1.2, quantityAvailable: 10 },
    { id: 2, name: 'Bread', description: 'Whole grain bread', price: 2.5, quantityAvailable: 5 },
    { id: 3, name: 'Milk', description: 'One litre of milk', price: 1.8, quantityAvailable: 8 },
    { id: 4, name: 'Chocolate', description: 'Dark chocolate bar', price: 3.25, quantityAvailable: 4 },
    { id: 5, name: 'Coffee', description: 'Ground coffee beans', price: 4.5, quantityAvailable: 0 }
  ];
}
