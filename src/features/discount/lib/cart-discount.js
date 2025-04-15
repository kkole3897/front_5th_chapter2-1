import {
  PRODUCT_IN_CART_DISCOUNT_QUANTITY_THRESHOLD,
  BULK_DISCOUNT_QUANTITY_THRESHOLD,
} from "../constants";

export const getDiscountRatePerProductInCart = (product, quantityInCart) => {
  const discountRateMap = {
    p1: 0.1,
    p2: 0.15,
    p3: 0.2,
    p4: 0.05,
    p5: 0.25,
  };

  if (quantityInCart < PRODUCT_IN_CART_DISCOUNT_QUANTITY_THRESHOLD) {
    return 0;
  }

  if (!(product.id in discountRateMap)) {
    return 0;
  }

  return discountRateMap[product.id];
};

export const isBulkDiscountAvailable = (totalQuantity) =>
  totalQuantity >= BULK_DISCOUNT_QUANTITY_THRESHOLD;
