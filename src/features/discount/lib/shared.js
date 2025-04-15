export const applyDiscount = (product, discountRate) => {
  product.price = Math.round(product.price * (1 - discountRate));
};
