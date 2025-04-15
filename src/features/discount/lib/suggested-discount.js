import { SUGGESTED_DISCOUNT_RATE } from "../constants";
import { hasStock } from "@/entities/product";

export const pickSuggestedDiscountProduct = (products, excludedProductId) => {
  const suggestedProduct = products.find(
    (product) => product.id !== excludedProductId && hasStock(product),
  );

  if (suggestedProduct) {
    return suggestedProduct;
  }

  return null;
};

export const alertSuggestedDiscount = (product) => {
  alert(
    `${product.name}은(는) 어떠세요? 지금 구매하시면 ${SUGGESTED_DISCOUNT_RATE * 100}% 추가 할인!`,
  );
};

export const generateSuggestedDiscountStartDelay = () => {
  return Math.random() * 20000;
};
