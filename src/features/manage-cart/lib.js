export const generateCartItemText = (product, quantityInCart) =>
  `${product.name} - ${product.price}원 x ${quantityInCart}`;
