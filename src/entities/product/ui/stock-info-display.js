import { WORDS } from "../constants";
import { hasStock, isStockLow } from "../lib";

export const generateStockAlertMessage = (product) => {
  if (!hasStock(product)) {
    return `${product.name}: ${WORDS.outOfStock}`;
  }

  if (isStockLow(product)) {
    return `${product.name}: 재고 부족 (${product.quantity}개 남음)`;
  }

  return "";
};
