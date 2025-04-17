import { type Product } from "@/entities/product";

export const applyDiscount = (product: Product, discountRate: number) => {
  product.price = Math.round(product.price * (1 - discountRate));
};
