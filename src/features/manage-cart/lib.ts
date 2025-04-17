import { type Product } from "@/entities/product";

export const generateCartItemText = (
  product: Product,
  quantityInCart: number,
) => `${product.name} - ${product.price}원 x ${quantityInCart}`;
