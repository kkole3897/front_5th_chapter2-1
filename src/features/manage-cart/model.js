let cartItemId = 1;

export const createCartItem = (productId, quantity) => {
  const id = cartItemId;
  cartItemId += 1;

  return {
    id,
    productId,
    quantity,
  };
};

export const getCartItemByProductId = (cart, productId) => {
  const found = cart.find((item) => item.productId === productId);

  if (!found) {
    return null;
  }

  return found;
};
