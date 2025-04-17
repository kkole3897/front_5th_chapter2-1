import { type Product } from "@/entities/product";

export interface CartItem {
  id: number;
  productId: Product["id"];
  quantity: number;
}

let cartItemId = 1;

export const createCartItem = (
  productId: Product["id"],
  quantity: number,
): CartItem => {
  const id = cartItemId;
  cartItemId += 1;

  return {
    id,
    productId,
    quantity,
  };
};

export const getCartItemByProductId = (
  cart: CartItem[],
  productId: Product["id"],
): CartItem | null => {
  const found = cart.find((item) => item.productId === productId);

  if (!found) {
    return null;
  }

  return found;
};
