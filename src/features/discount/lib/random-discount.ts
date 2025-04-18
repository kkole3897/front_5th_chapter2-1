import { type Product } from "@/entities/product";
import { RANDOM_DISCOUNT_RATE } from "../constants";
import { hasStock } from "@/entities/product";

export const pickRandomDiscountProduct = (products: Product[]) => {
  const RANDOM_THRESHOLD = 0.3;

  const luckyItem = products[Math.floor(Math.random() * products.length)];

  if (Math.random() < RANDOM_THRESHOLD && hasStock(luckyItem)) {
    return luckyItem;
  }

  return null;
};

export const alertRandomDiscount = (product: Product) => {
  alert(
    `번개세일! ${product.name}이(가) ${RANDOM_DISCOUNT_RATE * 100}% 할인 중입니다!`,
  );
};

export const generateRandomDiscountStartDelay = () => {
  return Math.random() * 10000;
};
